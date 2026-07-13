// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	useExtensionAccounts,
	useExtensions,
	useImportedAccounts,
} from '@polkadot-cloud/connect'
import { useLedger } from '@polkadot-cloud/connect-ledger'
import {
	type VaultSignatureResult,
	VaultSigner,
	type VaultSignStatus,
} from '@polkadot-cloud/connect-vault'
import type { HardwareAccount } from '@w3ux/types'
import { ManualSigners, StakingDappName } from 'consts'
import { TxErrorKeyMap } from 'consts/tx'
import { getStakingChainData } from 'consts/util'
import { compactU32 } from 'dedot/shape'
import type { InjectedSigner } from 'dedot/types'
import { concatU8a, hexToU8a } from 'dedot/utils'
import {
	addSend,
	addSignAndSend,
	addUid,
	emitNotification,
	getUid,
	pendingTxCount,
	setUidSubmitted,
	updateFee,
} from 'global-bus'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useProxySupported } from 'hooks/useProxySupported'
import { useTxMeta } from 'hooks/useTxMeta'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ActiveAccount } from 'types'
import { usePrompt } from 'ui-overlay'
import { QRSignPrompt } from '../QRSignPrompt'
import { signLedgerPayload } from '../Signers/LedgerSigner'
import type { UseSubmitExtrinsic, UseSubmitExtrinsicProps } from './types'

export const useSubmitExtrinsic = ({
	tx,
	tag,
	from,
	shouldSubmit,
	callbackSubmit,
	callbackInBlock,
}: UseSubmitExtrinsicProps): UseSubmitExtrinsic => {
	const { t } = useTranslation('app')
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { getTxSubmission } = useTxMeta()
	const { getAccountBalance } = useBalances()
	const { extensionsStatus } = useExtensions()
	const { handleResetLedgerTask } = useLedger()
	const { isProxySupported } = useProxySupported()
	const { openPromptWith, closePrompt } = usePrompt()
	const { getExtensionAccount } = useExtensionAccounts()
	const { getAccount, requiresManualSign } = useImportedAccounts()
	const { address: fromAddress, source, proxy } = from
	const {
		balances: { balanceTxFees },
	} = useAccountBalances(fromAddress)
	const { unit, units } = getStakingChainData(network)

	// Store the uid for this transaction
	const [uid, setUid] = useState<number>(0)

	// Get the imported account for the `from` address
	const fromAccount =
		fromAddress && source
			? getAccount({
					address: fromAddress,
					source: source,
				})
			: null

	// Use fromAccount as the submit account if it exists
	let submitAccount: ActiveAccount = fromAccount
		? { address: fromAccount.address, source: fromAccount.source }
		: null

	// If proxy account is active, wrap tx in a proxy call and set the sender to the proxy account. If
	// already wrapped, update submitAccount to the proxy account
	let proxySupported = false
	if (tx && submitAccount) {
		proxySupported = isProxySupported(tx, submitAccount.address, proxy)
		if (tx.call.pallet === 'Proxy' && tx.call.palletCall.name === 'Proxy') {
			if (proxy) {
				submitAccount = {
					address: proxy.address,
					source: proxy.source,
				}
			}
		} else {
			if (proxy && proxySupported) {
				// Update submit address to active proxy account
				const real = submitAccount.address
				submitAccount = {
					address: proxy.address,
					source: proxy.source,
				}

				// Check not a batch transaction
				if (
					real &&
					!(tx.call.pallet === 'Utility' && tx.call.palletCall.name === 'Batch')
				) {
					// Not a batch transaction: wrap tx in proxy call. Proxy calls should already be wrapping
					// each tx within the batch via `useBatchCall`
					const proxiedTx = serviceApi.tx.proxy(real, tx)
					if (proxiedTx) {
						tx = proxiedTx
					}
				}
			}
		}
	}

	// Extrinsic submission handler
	const onSubmit = async () => {
		if (!tx || getUid(uid)?.submitted) {
			return
		}
		if (!submitAccount) {
			return
		}
		const account = getAccount(submitAccount)
		if (account === null || !shouldSubmit) {
			return
		}

		const { specName, specVersion } = tx.client.runtimeVersion
		const ss58 = serviceApi.spec.ss58(specName)
		const { source } = account
		const isManualSigner = ManualSigners.includes(source)

		// If `activeAccount` is imported from an extension, ensure it is enabled
		if (!isManualSigner) {
			const isInstalled = Object.entries(extensionsStatus).find(
				([id, status]) => id === source && status === 'connected',
			)
			if (!isInstalled || !window?.injectedWeb3?.[source]) {
				throw new Error(`${t('walletNotFound')}`)
			}
			// NOTE: Summons extension popup if not already connected
			window.injectedWeb3[source].enable(StakingDappName)
		}

		// Pre-submission state update
		setUidSubmitted(uid, true)

		// Handle signed transaction
		let signer: InjectedSigner | undefined
		let encodedSig
		const handlers = {
			onReady,
			onInBlock,
			onFinalized,
			onFailed,
			onError,
		}

		if (requiresManualSign(submitAccount)) {
			const networkInfo = {
				decimals: units,
				tokenSymbol: unit,
				specName,
				specVersion,
				ss58,
			}

			const $Signature = serviceApi.codec.$Signature(specName)
			if (!$Signature) {
				onError('technical', 'missing_signer')
				return
			}

			if (source === 'ledger') {
				try {
					const metadata = await serviceApi.signer.metadata(specName)
					const result = await signLedgerPayload(
						specName,
						submitAccount.address,
						serviceApi.signer.extraSignedExtension,
						tx,
						metadata || '0x',
						networkInfo,
						(account as HardwareAccount).index,
					)
					if (result) {
						encodedSig = {
							address: submitAccount.address,
							signature: $Signature.tryDecode(result.signature),
							extra: result.data,
						}
					}
				} catch (_) {
					onError('ledger')
					return
				}
			}

			if (source === 'vault') {
				const extra = serviceApi.signer.extraSignedExtension(
					specName,
					submitAccount.address,
				)
				if (!extra) {
					onError('technical', 'missing_signer')
					return
				}
				await extra.init()
				const rawPayload = extra.toRawPayload(tx.callHex)
				const prefixedPayload = concatU8a(
					compactU32.encode(tx.callLength),
					hexToU8a(rawPayload.data),
				)
				const result = await new VaultSigner({
					openPrompt: (
						onComplete: (
							status: VaultSignStatus,
							result: VaultSignatureResult,
						) => void,
						toSign: Uint8Array,
					) => {
						openPromptWith(
							<QRSignPrompt
								submitAddress={submitAccount.address}
								onComplete={onComplete}
								toSign={toSign}
							/>,
							'sm',
							false,
						)
					},
					closePrompt: () => closePrompt(),
					setSubmitting: (val: boolean) => setUidSubmitted(uid, val),
				}).sign(prefixedPayload)

				if (result === null) {
					return
				}

				encodedSig = {
					address: submitAccount.address,
					signature: $Signature.tryDecode(result),
					extra: extra.data,
				}
			}

			// Custom signer
			//
			// Submit the transaction with the raw signature
			if (!encodedSig) {
				onError('technical', 'invalid_signer')
				return
			}
			addSend(network, uid, tx, encodedSig, handlers)
		} else {
			// Extension signer
			//
			// Get the signer for this account and submit the transaction
			signer = getExtensionAccount(submitAccount.address, submitAccount.source)
				?.signer as InjectedSigner | undefined
			if (!signer) {
				onError('technical', 'missing_signer')
				return
			}
			addSignAndSend(
				network,
				uid,
				submitAccount.address,
				tx,
				signer as InjectedSigner,
				getAccountBalance(submitAccount.address).nonce +
					pendingTxCount(submitAccount.address),
				handlers,
			)
		}
	}

	const onReady = () => {
		emitNotification({
			title: t('pending'),
			subtitle: t('transactionInitiated'),
		})
		if (callbackSubmit && typeof callbackSubmit === 'function') {
			callbackSubmit()
		}
	}

	const onInBlock = () => {
		emitNotification({
			title: t('inBlock'),
			subtitle: t('transactionInBlock'),
		})
		if (callbackInBlock && typeof callbackInBlock === 'function') {
			callbackInBlock()
		}
	}

	const onFinalized = () => {
		emitNotification({
			title: t('finalized'),
			subtitle: t('transactionSuccessful'),
		})
	}

	const onFailed = (error?: Error) => {
		const title = t('failed')
		let subtitle = t('errorWithTransaction')

		// Handle only known, user-reported errors - focus on balance-related issues
		if (error) {
			const msg = error.message.toLowerCase()
			if (
				/balance|reserve|locked|freeze|insufficient|funds|minimum/.test(msg)
			) {
				if (/locked|freeze/.test(msg)) {
					subtitle = t('errors.balanceErrorLocked')
				} else {
					subtitle = t('errors.balanceErrorReserveRequired')
				}
			}
		}
		emitNotification({
			title,
			subtitle,
		})
	}

	const onError = (type?: string, details?: string) => {
		setUidSubmitted(uid, false)

		if (type === 'ledger') {
			handleResetLedgerTask()
		}

		const txFee = getTxSubmission(uid)?.fee || 0n
		const hasInsufficientFunds = balanceTxFees < txFee

		let title = t('cancelled')
		let subtitle = t('transactionCancelled')

		if (type === 'insufficient_funds' || hasInsufficientFunds) {
			title = t('insufficientFunds')

			switch (tx?.call.pallet) {
				case 'Staking':
					subtitle = t('errors.addMoreDotForStaking', { unit })
					break
				case 'NominationPools':
					subtitle = t('errors.addMoreDotForPooling', { unit })
					break
				default:
					subtitle = t('errors.addMoreDotForFees', { unit })
					break
			}
		} else if (type === 'user_cancelled') {
			title = t('userCancelled')
			subtitle = t('userCancelledTransaction')
		} else if (type === 'technical') {
			subtitle = getTechnicalErrorMessage(details)
		}

		emitNotification({
			title,
			subtitle,
		})
	}

	// Helper function to get specific technical error messages
	const getTechnicalErrorMessage = (details?: string): string => {
		if (!details) {
			return t('transactionCancelledTechnical')
		}

		const translationKey = TxErrorKeyMap[details]
		return translationKey
			? t(translationKey)
			: t('transactionCancelledTechnical')
	}

	// Re-fetch tx fee if tx changes
	const fetchTxFee = async () => {
		if (tx && submitAccount?.address) {
			const { partialFee } = await tx.paymentInfo(submitAccount.address)
			updateFee(uid, partialFee)
		}
	}

	// Initialise tx submission
	useEffect(() => {
		// Add a new uid for this transaction
		if (uid === 0) {
			const newUid = addUid({ from: submitAccount?.address || null, tag })
			setUid(newUid)
		}
	}, [])

	useEffect(() => {
		if (uid > 0) {
			fetchTxFee()
		}
	}, [JSON.stringify(submitAccount), uid, JSON.stringify(tx?.toHex())])

	return {
		txInitiated: !!tx,
		uid,
		onSubmit,
		submitAccount,
		proxyAccount: proxy,
		proxySupported,
	}
}
