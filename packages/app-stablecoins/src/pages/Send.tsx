// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import {
	FeeAssetSymbols,
	getFeeTokenIcon,
	getStablecoinAssetConfig,
	getStablecoinChainLabel,
	isStablecoinFeeAssetSupported,
	isStablecoinSendAssetSupported,
	StablecoinChains,
	StablecoinSymbols,
} from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import {
	type TxFeeEstimator,
	useSubmitExtrinsic,
} from 'tx-submit/useSubmitExtrinsic'
import type {
	FeeAssetSymbol,
	ImportedAccount,
	StablecoinBalance,
	StablecoinChainId,
	StablecoinSymbol,
} from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown, type DropdownOption } from 'ui-app/Dropdown'
import { EstimatedTxFee } from 'ui-app/EstimatedTxFee'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import classes from './Send.module.scss'

const stablecoinOptions: DropdownOption<StablecoinSymbol>[] =
	StablecoinSymbols.map((symbol) => ({
		value: symbol,
		label: symbol,
		icon: getFeeTokenIcon(symbol),
	}))

const feeAssetOptions: DropdownOption<FeeAssetSymbol>[] = FeeAssetSymbols.map(
	(symbol) => ({
		value: symbol,
		label: symbol,
		icon: getFeeTokenIcon(symbol),
	}),
)

const chainOptions: DropdownOption<StablecoinChainId>[] = StablecoinChains.map(
	(chain) => ({
		value: chain,
		label: getStablecoinChainLabel(chain),
	}),
)

const isSameAccount = (a: ImportedAccount | null, b: ImportedAccount | null) =>
	a?.address === b?.address && a?.source === b?.source

const toPlanck = (amount: string, decimals: number): bigint => {
	try {
		return BigInt(unitToPlanck(amount || '0', decimals).toString())
	} catch {
		return 0n
	}
}

const formatBalance = (
	balance: StablecoinBalance | undefined,
	symbol: string,
): string => {
	if (!balance) {
		return `0 ${symbol}`
	}

	return `${planckToUnit(balance.free, balance.decimals)} ${symbol}`
}

const maxSendableBalance = (
	balance: StablecoinBalance | undefined,
	feeBalance: StablecoinBalance | undefined,
	fee: bigint,
): bigint => {
	if (!balance) {
		return 0n
	}

	const feeFromSameAsset =
		feeBalance?.chain === balance.chain && feeBalance.symbol === balance.symbol
	const reserved = balance.existentialDeposit + (feeFromSameAsset ? fee : 0n)
	const max = balance.free - reserved
	return max > 0n ? max : 0n
}

export const Send = () => {
	const { activeAccount } = useActiveAccount()
	const { accounts, accountHasSigner, getAccount } = useImportedAccounts()
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const [amount, setAmount] = useState('')
	const [selectedToken, setSelectedToken] = useState(stablecoinOptions[0])
	const [selectedChain, setSelectedChain] = useState(chainOptions[0])
	const [selectedFeeAsset, setSelectedFeeAsset] = useState(feeAssetOptions[0])
	const [transferTx, setTransferTx] = useState<SubmittableExtrinsic>()
	const [feeSetupTx, setFeeSetupTx] = useState<SubmittableExtrinsic>()
	const [hydrationFeeCurrency, setHydrationFeeCurrency] = useState<
		FeeAssetSymbol | undefined | null
	>(null)

	const selectedAssetConfig = getStablecoinAssetConfig(
		selectedChain.value,
		selectedToken.value,
	)
	const selectedFeeAssetConfig = getStablecoinAssetConfig(
		selectedChain.value,
		selectedFeeAsset.value,
	)
	const selectedDecimals = selectedAssetConfig?.decimals ?? 0
	const selectedFeeDecimals = selectedFeeAssetConfig?.decimals ?? 0
	const feeDisplay = {
		unit: selectedFeeAsset.value,
		units: selectedFeeDecimals,
	}

	const accountsWithSigners = useMemo(
		() =>
			accounts.filter((account) =>
				accountHasSigner({
					address: account.address,
					source: account.source,
				}),
			),
		[accounts, accountHasSigner],
	)
	const activeImportedAccount = getAccount(activeAccount)
	const defaultFromAccount =
		activeImportedAccount &&
		accountHasSigner({
			address: activeImportedAccount.address,
			source: activeImportedAccount.source,
		})
			? activeImportedAccount
			: accountsWithSigners[0] || null
	const defaultToAccount = accounts[0] || null

	const [fromAccount, setFromAccount] = useState<ImportedAccount | null>(
		defaultFromAccount,
	)
	const [toAccount, setToAccount] = useState<ImportedAccount | null>(
		defaultToAccount,
	)

	useEffect(() => {
		const fromAccountExists = accountsWithSigners.some((account) =>
			isSameAccount(account, fromAccount),
		)

		if (!fromAccountExists) {
			setFromAccount(defaultFromAccount)
		}
	}, [accountsWithSigners, defaultFromAccount, fromAccount])

	useEffect(() => {
		const toAccountExists = accounts.some((account) =>
			isSameAccount(account, toAccount),
		)

		if (!toAccountExists) {
			setToAccount(defaultToAccount)
		}
	}, [accounts, defaultToAccount, toAccount])

	const tokenOptions = useMemo(() => {
		return stablecoinOptions.filter((option) =>
			isStablecoinSendAssetSupported(selectedChain.value, option.value),
		)
	}, [selectedChain.value])

	const availableFeeAssetOptions = useMemo(() => {
		return feeAssetOptions.filter((option) =>
			isStablecoinFeeAssetSupported(selectedChain.value, option.value),
		)
	}, [selectedChain.value])

	useEffect(() => {
		if (
			!isStablecoinSendAssetSupported(selectedChain.value, selectedToken.value)
		) {
			if (tokenOptions[0]) {
				setSelectedToken(tokenOptions[0])
			}
		}
	}, [selectedChain.value, selectedToken.value, tokenOptions])

	useEffect(() => {
		if (
			!isStablecoinFeeAssetSupported(
				selectedChain.value,
				selectedFeeAsset.value,
			)
		) {
			setSelectedFeeAsset(feeAssetOptions[0])
		}
	}, [selectedChain.value, selectedFeeAsset.value])

	const {
		getBalance,
		loading: balancesLoading,
		refresh: refreshBalances,
	} = useStablecoinBalances(fromAccount?.address)

	const selectedTokenBalance = getBalance(
		selectedChain.value,
		selectedToken.value,
	)
	const selectedFeeAssetBalance = getBalance(
		selectedChain.value,
		selectedFeeAsset.value,
	)

	const amountPlanck = useMemo(
		() => toPlanck(amount, selectedDecimals),
		[amount, selectedDecimals],
	)
	const feePaymentOptions = serviceApi.stablecoins.fee.paymentOptions(
		selectedChain.value,
		selectedFeeAsset.value,
	)
	const feeEstimator = useMemo<TxFeeEstimator>(
		() =>
			({ tx, from, feePaymentOptions: payloadOptions }) =>
				serviceApi.stablecoins.fee.estimate({
					chain: selectedChain.value,
					symbol: selectedFeeAsset.value,
					tx,
					from,
					payloadOptions,
				}),
		[serviceApi, selectedChain.value, selectedFeeAsset.value],
	)

	const needsHydrationFeeSetup =
		selectedChain.value === 'hydration' &&
		!!fromAccount?.address &&
		hydrationFeeCurrency !== null &&
		hydrationFeeCurrency !== selectedFeeAsset.value

	const feeSetupSubmit = useSubmitExtrinsic({
		tx: feeSetupTx,
		tag: 'stablecoin-fee-setup',
		from: {
			address: fromAccount?.address || null,
			source: fromAccount?.source || null,
		},
		shouldSubmit: needsHydrationFeeSetup,
		feeEstimator,
		feeDisplay,
		callbackInBlock: () => {
			refreshBalances()
			if (fromAccount?.address) {
				serviceApi.stablecoins.query
					.hydrationFeeCurrency(fromAccount.address)
					.then(setHydrationFeeCurrency)
			}
		},
	})

	const transferSubmit = useSubmitExtrinsic({
		tx: needsHydrationFeeSetup ? undefined : transferTx,
		tag: 'stablecoin-send',
		from: {
			address: fromAccount?.address || null,
			source: fromAccount?.source || null,
		},
		shouldSubmit: !needsHydrationFeeSetup,
		feePaymentOptions,
		feeEstimator,
		feeDisplay,
		callbackInBlock: refreshBalances,
	})

	const activeSubmit = needsHydrationFeeSetup ? feeSetupSubmit : transferSubmit
	const activeFee = getTxSubmission(activeSubmit.uid)?.fee || 0n
	const maxAvailableToSend = maxSendableBalance(
		selectedTokenBalance,
		selectedFeeAssetBalance,
		needsHydrationFeeSetup ? 0n : activeFee,
	)

	const hasEnoughTransferBalance =
		amountPlanck > 0n &&
		!!selectedTokenBalance &&
		amountPlanck <= maxAvailableToSend
	const hasRecipient = !!toAccount?.address
	const hasSender = !!fromAccount?.address && !!fromAccount?.source
	const validTransfer =
		hasSender &&
		hasRecipient &&
		!isSameAccount(fromAccount, toAccount) &&
		hasEnoughTransferBalance &&
		!!transferTx &&
		!needsHydrationFeeSetup
	const validFeeSetup = needsHydrationFeeSetup && !!feeSetupTx

	useEffect(() => {
		let stale = false

		const buildTransferTx = async () => {
			if (
				!toAccount?.address ||
				amountPlanck <= 0n ||
				!isStablecoinSendAssetSupported(
					selectedChain.value,
					selectedToken.value,
				)
			) {
				setTransferTx(undefined)
				return
			}

			const tx = await serviceApi.stablecoins.tx.transfer({
				chain: selectedChain.value,
				symbol: selectedToken.value,
				recipient: toAccount.address,
				amount: amountPlanck,
			})
			if (!stale) {
				setTransferTx(tx)
			}
		}

		buildTransferTx()

		return () => {
			stale = true
		}
	}, [
		amountPlanck,
		selectedChain.value,
		selectedToken.value,
		serviceApi,
		toAccount?.address,
	])

	useEffect(() => {
		let stale = false

		const buildFeeSetupTx = async () => {
			if (!needsHydrationFeeSetup) {
				setFeeSetupTx(undefined)
				return
			}

			const tx = await serviceApi.stablecoins.tx.setHydrationFeeCurrency(
				selectedFeeAsset.value,
			)
			if (!stale) {
				setFeeSetupTx(tx)
			}
		}

		buildFeeSetupTx()

		return () => {
			stale = true
		}
	}, [needsHydrationFeeSetup, selectedFeeAsset.value, serviceApi])

	useEffect(() => {
		let stale = false

		const fetchHydrationFeeCurrency = async () => {
			if (selectedChain.value !== 'hydration' || !fromAccount?.address) {
				setHydrationFeeCurrency(null)
				return
			}

			setHydrationFeeCurrency(null)
			const currency = await serviceApi.stablecoins.query.hydrationFeeCurrency(
				fromAccount.address,
			)
			if (!stale) {
				setHydrationFeeCurrency(currency)
			}
		}

		fetchHydrationFeeCurrency()

		return () => {
			stale = true
		}
	}, [fromAccount?.address, selectedChain.value, serviceApi])

	return (
		<Page.Row>
			<SendForm.Container>
				<SendForm.Header
					title="Send Assets"
					subtitle="Transfer stablecoins to another address on the same network."
				/>

				<SendForm.Card>
					<SendForm.Segment title="Chain" layer="top">
						<Dropdown
							options={chainOptions}
							selected={selectedChain}
							onSelect={setSelectedChain}
							variant="full"
						/>
					</SendForm.Segment>

					<SendForm.Segment title="Send From" layer="raised">
						<div className={classes.accountDropdown}>
							<AccountDropdown
								key={`from-${fromAccount?.address || 'empty'}-${
									fromAccount?.source || 'none'
								}`}
								initialAccount={fromAccount}
								accounts={accountsWithSigners}
								onSelect={setFromAccount}
								placeholder="Select sender account..."
								disabled={!accountsWithSigners.length}
							/>
						</div>
					</SendForm.Segment>

					<SendForm.DirectionIndicator />

					<SendForm.Segment title="Send To" layer="raised">
						<div className={classes.accountDropdown}>
							<AccountDropdown
								key={`to-${toAccount?.address || 'empty'}-${
									toAccount?.source || 'none'
								}`}
								initialAccount={toAccount}
								accounts={accounts}
								onSelect={setToAccount}
								placeholder="Enter recipient address..."
							/>
						</div>
					</SendForm.Segment>

					<BalanceInputMulti
						label="Asset to Send"
						value={amount}
						onChange={setAmount}
						maxAvailable={planckToUnit(maxAvailableToSend, selectedDecimals)}
						maxDecimals={selectedDecimals}
						syncing={balancesLoading}
						options={tokenOptions}
						selected={selectedToken}
						onSelect={setSelectedToken}
						ariaLabel="Amount to send"
					/>

					<SendForm.Segment
						title="Pay Fees In"
						headerContent={
							<SendForm.Label label="Available">
								{balancesLoading
									? '...'
									: formatBalance(
											selectedFeeAssetBalance,
											selectedFeeAsset.value,
										)}
							</SendForm.Label>
						}
					>
						<Dropdown
							options={availableFeeAssetOptions}
							selected={selectedFeeAsset}
							onSelect={setSelectedFeeAsset}
							variant="full"
						/>
					</SendForm.Segment>

					<SendForm.Notes>
						<SendForm.Note label="Network Fee">
							<EstimatedTxFee uid={activeSubmit.uid} feeDisplay={feeDisplay} />
						</SendForm.Note>
						{needsHydrationFeeSetup && (
							<SendForm.Note label="Fee Token" variant="success">
								Set {selectedFeeAsset.value} before sending
							</SendForm.Note>
						)}
					</SendForm.Notes>

					<SendForm.Action>
						<SubmitTx
							{...activeSubmit}
							submitText={
								needsHydrationFeeSetup ? 'Set Fee Token' : 'Send Assets'
							}
							valid={needsHydrationFeeSetup ? validFeeSetup : validTransfer}
							noMargin
							feeDisplay={feeDisplay}
							feeBalance={selectedFeeAssetBalance?.free ?? 0n}
							hideSigner
							transparent
						/>
					</SendForm.Action>
				</SendForm.Card>
			</SendForm.Container>
		</Page.Row>
	)
}
