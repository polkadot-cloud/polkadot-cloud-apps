import {
	faArrowDown,
	faCheck,
	faChevronDown,
	faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import hollarSvg from 'assets/token/hollar.svg'
import usdcSvg from 'assets/token/usdc.svg'
import usdtSvg from 'assets/token/usdt.svg'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { Page } from 'ui-core/base'
import classes from './Send.module.scss'

type Stablecoin = 'USDC' | 'USDT' | 'HOLLAR'
type Chain = 'assetHub' | 'hydration'

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

const stablecoinOptions: SelectOption<Stablecoin>[] = [
	{ value: 'USDC', label: 'USDC', icon: usdcSvg },
	{ value: 'USDT', label: 'USDT', icon: usdtSvg },
	{ value: 'HOLLAR', label: 'HOLLAR', icon: hollarSvg },
]

const dummyAvailableBalances: Record<
	Stablecoin,
	{ display: string; amount: string }
> = {
	USDC: { display: '750,000.00 USDC', amount: '750000.00' },
	USDT: { display: '185,200.00 USDT', amount: '185200.00' },
	HOLLAR: { display: '150,000.00 HOLLAR', amount: '150000.00' },
}

const chainOptions: SelectOption<Chain>[] = [
	{ value: 'assetHub', label: 'Polkadot  Hub' },
	{ value: 'hydration', label: 'Hydration' },
]

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
	const { network } = useNetwork()
	const { units } = getStakingChainData(network)
	const [amount, setAmount] = useState('1000.00')
	const [selectedToken, setSelectedToken] = useState(stablecoinOptions[0])
	const [selectedChain, setSelectedChain] = useState(chainOptions[0])
	const selectedTokenBalance = dummyAvailableBalances[selectedToken.value]

	const handleAmountChange = (nextValue: string) => {
		setAmount(sanitizeAmountInput(nextValue, units))
	}

	const handleAmountBlur = () => {
		if (amount.endsWith('.')) {
			setAmount(amount.slice(0, -1))
		}
	}

	const handleUseAvailableBalance = () => {
		setAmount(sanitizeAmountInput(selectedTokenBalance.amount, units))
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
										{selectedTokenBalance.display}
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
								options={stablecoinOptions}
								selected={selectedToken}
								onSelect={setSelectedToken}
							/>
						</div>
					</div>

					<div className={classes.details}>
						<div className={classes.detailRow}>
							<span className={classes.detailLabel}>Network Fee</span>
							<span className={classes.detailValue}>0.002 DOT</span>
						</div>
						<div className={classes.detailRow}>
							<span className={classes.detailLabel}>Estimated Time</span>
							<span className={classes.detailValueGreen}>~6 Seconds</span>
						</div>
					</div>

					<div className={classes.actionWrapper}>
						<button type="button" className={classes.actionBtn}>
							<FontAwesomeIcon
								icon={faPaperPlane}
								className={classes.actionBtnIcon}
							/>
							Send Assets
						</button>
					</div>
				</div>
			</div>
		</Page.Row>
	)
}
