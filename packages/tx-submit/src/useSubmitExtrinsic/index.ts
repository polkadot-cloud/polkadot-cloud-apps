// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	useExtensionAccounts,
	useImportedAccounts,
} from '@polkadot-cloud/connect'
import { signLedgerPayload, useLedger } from '@polkadot-cloud/connect-ledger'
import { VaultSigner } from '@polkadot-cloud/connect-vault'
import type { HardwareAccount } from '@w3ux/types'
import { ManualSigners } from 'consts'
import { TxErrorKeyMap } from 'consts/tx'
import { getStakingChainData } from 'consts/util'
import { SubmittableExtrinsic } from 'dedot'
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
import { useNetwork } from 'hooks/useNetwork'
import { useProxySupported } from 'hooks/useProxySupported'
import { useTxMeta } from 'hooks/useTxMeta'
import { createElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ActiveAccount } from 'types'
import { usePrompt } from 'ui-overlay'
import { QRSignPrompt } from '../QRSignPrompt'
import { stringifyWithBigInt } from '../util'
import type { UseSubmitExtrinsic, UseSubmitExtrinsicProps } from './types'

export type {
	TxFeeEstimator,
	TxFeeEstimatorInput,
	UseSubmitExtrinsic,
	UseSubmitExtrinsicProps,
} from './types'

export const useSubmitExtrinsic = ({
	tx,
	tag,
	from,
	shouldSubmit,
	feePaymentOptions,
	feeEstimator,
	feeDisplay,
	callbackSubmit,
	callbackInBlock,
}: UseSubmitExtrinsicProps): UseSubmitExtrinsic => {
	const { t } = useTranslation('app')
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { getTxSubmission } = useTxMeta()
	const { handleResetLedgerTask } = useLedger()
	const { isProxySupported } = useProxySupported()
	const { openPromptWith, closePrompt } = usePrompt()
	const { connectExtension, getExtensionAccount } = useExtensionAccounts()
	const { getAccount, requiresManualSign } = useImportedAccounts()
	const { address: fromAddress, source, proxy = null } = from
	const {
		balances: { balanceTxFees },
	} = useAccountBalances(fromAddress)
	const { unit, units } = getStakingChainData(network)
	const [uid, setUid] = useState<number>(0)

	const fromAccount =
		fromAddress && source
			? getAccount({
					address: fromAddress,
					source,
				})
			: null

	let submitAccount: ActiveAccount = fromAccount
		? { address: fromAccount.address, source: fromAccount.source }
		: null
	let submitTx = tx

	let proxySupported = false
	if (submitTx && submitAccount) {
		proxySupported = isProxySupported(submitTx, submitAccount.address, proxy)
		if (
			submitTx.call.pallet === 'Proxy' &&
			submitTx.call.palletCall.name === 'Proxy'
		) {
			if (proxy) {
				submitAccount = {
					address: proxy.address,
					source: proxy.source,
				}
			}
		} else if (proxy && proxySupported) {
			const real = submitAccount.address
			submitAccount = {
				address: proxy.address,
				source: proxy.source,
			}

			if (
				real &&
				!(
					submitTx.call.pallet === 'Utility' &&
					submitTx.call.palletCall.name === 'Batch'
				)
			) {
				const proxiedTx = serviceApi.tx.proxy(real, submitTx)
				if (proxiedTx) {
					submitTx = proxiedTx
				}
			}
		}
	}

	const onSubmit = async () => {
		if (!submitTx || getUid(uid)?.submitted || !submitAccount) {
			return
		}

		const account = getAccount(submitAccount)
		if (account === null || !shouldSubmit) {
			return
		}

		const { specName } = submitTx.client.runtimeVersion
		const { source } = account
		const isManualSigner = ManualSigners.includes(source)

		if (!isManualSigner) {
			const connected = await connectExtension(source)
			if (!connected) {
				throw new Error(t('walletNotFound'))
			}
		}

		setUidSubmitted(uid, true)

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
				decimals: feeDisplay?.units ?? units,
				tokenSymbol: feeDisplay?.unit || unit,
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
						submitTx,
						metadata || '0x',
						networkInfo,
						(account as HardwareAccount).index,
						feePaymentOptions,
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
					feePaymentOptions,
				)
				if (!extra) {
					onError('technical', 'missing_signer')
					return
				}
				await extra.init()
				const rawPayload = extra.toRawPayload(submitTx.callHex)
				const prefixedPayload = concatU8a(
					compactU32.encode(submitTx.callLength),
					hexToU8a(rawPayload.data),
				)
				const result = await new VaultSigner({
					openPrompt: (onComplete, toSign) => {
						openPromptWith(
							createElement(QRSignPrompt, {
								submitAddress: submitAccount.address,
								genesisHash: submitTx.client.genesisHash,
								onComplete,
								toSign,
							}),
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

			if (!encodedSig) {
				onError('technical', 'invalid_signer')
				return
			}
			addSend(network, uid, submitTx, encodedSig, handlers)
		} else {
			const signer = getExtensionAccount(
				submitAccount.address,
				submitAccount.source,
			)?.signer as InjectedSigner | undefined
			if (!signer) {
				onError('technical', 'missing_signer')
				return
			}
			const { nonce } = await submitTx.client.query.system.account(
				submitAccount.address,
			)
			addSignAndSend(
				network,
				uid,
				submitAccount.address,
				submitTx,
				signer,
				nonce + pendingTxCount(network, submitAccount.address),
				handlers,
				feePaymentOptions,
			)
		}
	}

	const onReady = () => {
		emitNotification({
			title: t('pending'),
			subtitle: t('transactionInitiated'),
		})
		callbackSubmit?.()
	}

	const onInBlock = () => {
		emitNotification({
			title: t('inBlock'),
			subtitle: t('transactionInBlock'),
		})
		callbackInBlock?.()
	}

	const onFinalized = () => {
		emitNotification({
			title: t('finalized'),
			subtitle: t('transactionSuccessful'),
		})
	}

	const onFailed = (error?: Error) => {
		const displayUnit = feeDisplay?.unit || unit
		let subtitle = t('errorWithTransaction')

		if (error) {
			const msg = error.message.toLowerCase()
			if (
				/balance|reserve|locked|freeze|insufficient|funds|minimum/.test(msg)
			) {
				subtitle = /locked|freeze/.test(msg)
					? t('errors.balanceErrorLocked')
					: t('errors.balanceErrorReserveRequired', { unit: displayUnit })
			}
		}

		emitNotification({
			title: t('failed'),
			subtitle,
		})
	}

	const onError = (type?: string, details?: string) => {
		setUidSubmitted(uid, false)

		if (type === 'ledger') {
			handleResetLedgerTask()
		}

		const displayUnit = feeDisplay?.unit || unit
		const txFee = getTxSubmission(uid)?.fee || 0n
		const hasInsufficientFunds = balanceTxFees < txFee

		let title = t('cancelled')
		let subtitle = t('transactionCancelled')

		if (type === 'insufficient_funds' || hasInsufficientFunds) {
			title = t('insufficientFunds')

			switch (submitTx?.call.pallet) {
				case 'Staking':
					subtitle = t('errors.addMoreDotForStaking', { unit: displayUnit })
					break
				case 'NominationPools':
					subtitle = t('errors.addMoreDotForPooling', { unit: displayUnit })
					break
				default:
					subtitle = t('errors.addMoreDotForFees', { unit: displayUnit })
					break
			}
		} else if (type === 'user_cancelled') {
			title = t('userCancelled')
			subtitle = t('userCancelledTransaction')
		} else if (type === 'technical') {
			const translationKey = details ? TxErrorKeyMap[details] : undefined
			subtitle = translationKey
				? t(translationKey)
				: t('transactionCancelledTechnical')
		}

		emitNotification({
			title,
			subtitle,
		})
	}

	const fetchTxFee = async () => {
		if (submitTx && submitAccount?.address) {
			updateFee(uid, 0n)
			const feeTx = SubmittableExtrinsic.fromTx(
				submitTx.client as Parameters<typeof SubmittableExtrinsic.fromTx>[0],
				submitTx.call,
			)
			try {
				const partialFee = feeEstimator
					? await feeEstimator({
							tx: feeTx,
							from: submitAccount.address,
							feePaymentOptions,
						})
					: (await feeTx.paymentInfo(submitAccount.address, feePaymentOptions))
							.partialFee
				updateFee(uid, partialFee)
			} catch {
				updateFee(uid, 0n)
			}
		}
	}

	const submitAccountKey = stringifyWithBigInt(submitAccount)
	const feePaymentOptionsKey = stringifyWithBigInt(feePaymentOptions)
	const txHex = submitTx?.toHex()

	useEffect(() => {
		if (uid === 0) {
			const newUid = addUid({
				network,
				from: submitAccount?.address || null,
				tag,
			})
			setUid(newUid)
		}
	}, [submitAccount?.address, tag, network, uid])

	useEffect(() => {
		if (uid > 0) {
			fetchTxFee()
		}
	}, [submitAccountKey, uid, feePaymentOptionsKey, txHex, feeEstimator])

	return {
		txInitiated: !!submitTx,
		uid,
		onSubmit,
		submitAccount,
		proxyAccount: proxy,
		proxySupported,
	}
}
