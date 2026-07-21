// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowDown,
	faCheck,
	faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import dotSvg from 'assets/token/dot.svg'
import hollarSvg from 'assets/token/hollar.svg'
import usdcSvg from 'assets/token/usdc.svg'
import usdtSvg from 'assets/token/usdt.svg'
import {
	getStablecoinAssetConfig,
	getStablecoinChainLabel,
	isStablecoinFeeAssetSupported,
	isStablecoinSendAssetSupported,
	StablecoinChains,
	StablecoinFeeAssetSymbols,
	StablecoinSymbols,
} from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	type TxFeeEstimator,
	useSubmitExtrinsic,
} from 'tx-submit/useSubmitExtrinsic'
import type {
	ImportedAccount,
	StablecoinBalance,
	StablecoinChainId,
	StablecoinFeeAssetSymbol,
	StablecoinSymbol,
} from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { EstimatedTxFee } from 'ui-app/EstimatedTxFee'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Page } from 'ui-core/base'
import classes from './Send.module.scss'

type SelectOption<T extends string> = {
	value: T
	label: string
	icon?: string
}

type SendSelectProps<T extends string> = {
	options: SelectOption<T>[]
	selected: SelectOption<T>
	onSelect: (option: SelectOption<T>) => void
	variant?: 'compact' | 'full'
}

const tokenIcons: Record<StablecoinFeeAssetSymbol, string> = {
	DOT: dotSvg,
	USDC: usdcSvg,
	USDT: usdtSvg,
	HOLLAR: hollarSvg,
}

const stablecoinOptions: SelectOption<StablecoinSymbol>[] =
	StablecoinSymbols.map((symbol) => ({
		value: symbol,
		label: symbol,
		icon: tokenIcons[symbol],
	}))

const feeAssetOptions: SelectOption<StablecoinFeeAssetSymbol>[] =
	StablecoinFeeAssetSymbols.map((symbol) => ({
		value: symbol,
		label: symbol,
		icon: tokenIcons[symbol],
	}))

const chainOptions: SelectOption<StablecoinChainId>[] = StablecoinChains.map(
	(chain) => ({
		value: chain,
		label: getStablecoinChainLabel(chain),
	}),
)

const isSameAccount = (a: ImportedAccount | null, b: ImportedAccount | null) =>
	a?.address === b?.address && a?.source === b?.source

const sanitizeAmountInput = (value: string, maxDecimals: number): string => {
	const normalized = value.replace(/[^\d.]/g, '')

	if (!normalized) {
		return ''
	}

	const dotIndex = normalized.indexOf('.')

	if (dotIndex === -1) {
		return normalized
	}

	const integerPart = normalized.slice(0, dotIndex) || '0'
	const decimalPart = normalized
		.slice(dotIndex + 1)
		.replace(/\./g, '')
		.slice(0, maxDecimals)

	if (normalized.endsWith('.') && !decimalPart.length) {
		return `${integerPart}.`
	}

	return `${integerPart}.${decimalPart}`
}

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

function SendSelect<T extends string>({
	options,
	selected,
	onSelect,
	variant = 'compact',
}: SendSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	return (
		<div className={classes.selectWrapper} ref={ref}>
			<button
				type="button"
				className={`${classes.selectTrigger} ${
					variant === 'full'
						? classes.selectTriggerFull
						: classes.selectTriggerCompact
				}`}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((open) => !open)}
			>
				<span className={classes.selectValue}>
					{selected.icon && (
						<img
							src={selected.icon}
							alt={selected.label}
							className={classes.tokenIcon}
						/>
					)}
					<span className={classes.tokenName}>{selected.label}</span>
				</span>
				<FontAwesomeIcon
					icon={faChevronDown}
					className={classes.tokenChevron}
				/>
			</button>

			{isOpen && (
				<div
					className={`${classes.selectMenu} ${
						variant === 'full' ? classes.selectMenuTopLayer : ''
					}`}
					role="listbox"
				>
					{options.map((option) => {
						const selectedOption = option.value === selected.value

						return (
							<button
								type="button"
								key={option.value}
								className={`${classes.selectOption} ${
									selectedOption ? classes.selectOptionActive : ''
								}`}
								role="option"
								aria-selected={selectedOption}
								onClick={() => {
									onSelect(option)
									setIsOpen(false)
								}}
							>
								<span className={classes.selectValue}>
									{option.icon && (
										<img
											src={option.icon}
											alt={option.label}
											className={classes.tokenIcon}
										/>
									)}
									<span>{option.label}</span>
								</span>
								{selectedOption && (
									<FontAwesomeIcon
										icon={faCheck}
										className={classes.selectCheck}
									/>
								)}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}

export const Send = () => {
	const { activeAccount } = useActiveAccount()
	const { accounts, accountHasSigner, getAccount } = useImportedAccounts()
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const [amount, setAmount] = useState('1000.00')
	const [selectedToken, setSelectedToken] = useState(stablecoinOptions[0])
	const [selectedChain, setSelectedChain] = useState(chainOptions[0])
	const [selectedFeeAsset, setSelectedFeeAsset] = useState(feeAssetOptions[0])
	const [transferTx, setTransferTx] = useState<SubmittableExtrinsic>()
	const [feeSetupTx, setFeeSetupTx] = useState<SubmittableExtrinsic>()
	const [hydrationFeeCurrency, setHydrationFeeCurrency] = useState<
		StablecoinFeeAssetSymbol | undefined | null
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

	const handleAmountChange = (nextValue: string) => {
		setAmount(sanitizeAmountInput(nextValue, selectedDecimals))
	}

	const handleAmountBlur = () => {
		if (amount.endsWith('.')) {
			setAmount(amount.slice(0, -1))
		}
	}

	const handleUseAvailableBalance = () => {
		setAmount(
			sanitizeAmountInput(
				planckToUnit(maxAvailableToSend, selectedDecimals),
				selectedDecimals,
			),
		)
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

		if ((!fromAccount || !fromAccountExists) && defaultFromAccount) {
			setFromAccount(defaultFromAccount)
		}
	}, [accountsWithSigners, defaultFromAccount, fromAccount])

	useEffect(() => {
		if (!toAccount && defaultToAccount) {
			setToAccount(defaultToAccount)
		}
	}, [defaultToAccount, toAccount])

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
			<div className={classes.page}>
				<header className={classes.header}>
					<h1 className={classes.title}>Send Assets</h1>
					<p className={classes.subtitle}>
						Transfer stablecoins to another address on the same network.
					</p>
				</header>

				<div className={classes.card}>
					<div
						className={`${classes.inputSectionTop} ${classes.chainSectionTop}`}
					>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Chain</span>
						</div>
						<SendSelect
							options={chainOptions}
							selected={selectedChain}
							onSelect={setSelectedChain}
							variant="full"
						/>
					</div>

					<div className={classes.inputSectionTop}>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Send From</span>
						</div>
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
					</div>

					<div className={classes.directionIndicator}>
						<div className={classes.directionButton}>
							<FontAwesomeIcon
								icon={faArrowDown}
								className={classes.directionIcon}
							/>
						</div>
					</div>

					<div className={classes.inputSectionTop}>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Send To</span>
						</div>
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
					</div>

					<div className={classes.inputSection}>
						<div className={classes.assetLabelRow}>
							<span className={classes.sectionLabel}>Asset to Send</span>
							<span className={classes.balanceLabel}>
								Available:{' '}
								<button
									type="button"
									onClick={handleUseAvailableBalance}
									className={classes.balanceAvailableButton}
								>
									<span className={classes.balanceHighlight}>
										{balancesLoading
											? '...'
											: formatBalance(
													selectedTokenBalance,
													selectedToken.value,
												)}
									</span>
								</button>
							</span>
						</div>
						<div className={classes.inputRow}>
							<input
								type="text"
								value={amount}
								onChange={(e) => handleAmountChange(e.target.value)}
								onBlur={handleAmountBlur}
								className={classes.amountInput}
								placeholder="0.00"
								inputMode="decimal"
								autoComplete="off"
								aria-label="Amount to send"
							/>
							<SendSelect
								options={tokenOptions}
								selected={selectedToken}
								onSelect={setSelectedToken}
							/>
						</div>
					</div>

					<div className={classes.inputSection}>
						<div className={classes.sectionLabelRow}>
							<span className={classes.sectionLabel}>Pay Fees In</span>
							<span className={classes.balanceLabel}>
								Available:{' '}
								<span className={classes.balanceHighlight}>
									{balancesLoading
										? '...'
										: formatBalance(
												selectedFeeAssetBalance,
												selectedFeeAsset.value,
											)}
								</span>
							</span>
						</div>
						<SendSelect
							options={availableFeeAssetOptions}
							selected={selectedFeeAsset}
							onSelect={setSelectedFeeAsset}
							variant="full"
						/>
					</div>

					<div className={classes.details}>
						<div className={classes.detailRow}>
							<span className={classes.detailLabel}>Network Fee</span>
							<span className={classes.detailValue}>
								<EstimatedTxFee
									uid={activeSubmit.uid}
									feeDisplay={feeDisplay}
								/>
							</span>
						</div>
						{needsHydrationFeeSetup && (
							<div className={classes.detailRow}>
								<span className={classes.detailLabel}>Fee Token</span>
								<span className={classes.detailValueGreen}>
									Set {selectedFeeAsset.value} before sending
								</span>
							</div>
						)}
					</div>

					<div className={classes.actionWrapper}>
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
					</div>
				</div>
			</div>
		</Page.Row>
	)
}
