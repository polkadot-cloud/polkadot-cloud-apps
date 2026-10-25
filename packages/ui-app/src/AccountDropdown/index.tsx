// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { formatAccountSs58, isValidAddress } from '@polkadot-cloud/util-dedot'
import { ellipsisFn, planckToUnit } from '@polkadot-cloud/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util/chains'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useOutsideAlerter } from 'hooks/useOutsideAlerter'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import type { ImportedAccount } from 'types'
import { AccountInput } from 'ui-core/input'
import { RootPortal } from 'ui-core/portal'
import { getTransferableBalance } from 'utils'
import type { AccountDropdownProps } from './types'
import { getAccountSourceIcon } from './util'

export const AccountSourceIcon = ({
	source,
	className,
}: {
	source?: string
	className?: string
}) => (
	<AccountInput.SourceIcon
		className={className}
		SvgIcon={getAccountSourceIcon(source)}
		faIcon={source === 'external' ? faGlasses : undefined}
	/>
)

export const AccountDropdown = ({
	accounts,
	initialAccount,
	onSelect,
	onOpenChange,
	label,
	placeholder,
	disabled = false,
	allowCustomAccounts = true,
}: AccountDropdownProps) => {
	const { t } = useTranslation()
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { units, unit, ss58 } = getStakingChainData(network)

	const instanceId = useId()
	const containerClass = `selected-account-${instanceId}`
	const dropdownClass = `account-input-dropdown-${instanceId}`

	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(
			initialAccount === undefined ? (accounts[0] ?? null) : initialAccount,
		)

	const selectedAddress = selectedAccount?.address || ''
	const [transferableBalance, setTransferableBalance] = useState<bigint>(0n)
	const [isOpen, setIsOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [isInputFocused, setIsInputFocused] = useState(false)
	const [dropdownPosition, setDropdownPosition] = useState<{
		top: number
		left: number
		width: number
	} | null>(null)

	const handleFetchBalance = async (address: string) => {
		if (!address) return
		const result = await serviceApi.query.accountBalance.hub(address)
		const balance = getTransferableBalance(result?.free || 0n, 0n)
		setTransferableBalance(balance)
	}

	const dropdownRef = useRef<HTMLDivElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isOpen && dropdownRef.current) {
			const rect = dropdownRef.current.getBoundingClientRect()
			setDropdownPosition({
				top: rect.bottom + window.scrollY - 1,
				left: rect.left + window.scrollX,
				width: rect.width,
			})
		}
	}, [isOpen])

	useEffect(() => {
		const handleResize = () => {
			if (isOpen) {
				setIsOpen(false)
			}
		}
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [isOpen])

	useEffect(() => {
		const handleScroll = (e: Event) => {
			if (
				isOpen &&
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setIsOpen(false)
				setSearchTerm('')
				setIsInputFocused(false)
			}
		}
		window.addEventListener('scroll', handleScroll, true)
		return () => {
			window.removeEventListener('scroll', handleScroll, true)
		}
	}, [isOpen])

	useEffect(() => {
		onOpenChange?.(isOpen)
	}, [isOpen, accounts.map((acc) => acc.address).join(',')])

	useEffect(() => {
		handleFetchBalance(selectedAddress)
	}, [selectedAddress])

	useEffect(() => {
		if (
			initialAccount === undefined &&
			!selectedAccount &&
			accounts.length > 0
		) {
			setSelectedAccount(accounts[0])
		}
	}, [accounts, selectedAccount, initialAccount])

	const filterAccounts = (term: string) => {
		const query = term.toLowerCase()
		return accounts.filter(
			({ address, name }) =>
				address.toLowerCase().includes(query) ||
				name?.toLowerCase().includes(query),
		)
	}

	let filteredAccounts = filterAccounts(searchTerm)

	if (allowCustomAccounts && isValidAddress(searchTerm)) {
		const formattedAddress = formatAccountSs58(searchTerm, ss58)
		if (
			formattedAddress !== null &&
			!accounts.some(({ address }) => address === formattedAddress)
		) {
			filteredAccounts = [
				{
					address: formattedAddress,
					name: formattedAddress,
					source: 'external',
				},
				...filteredAccounts,
			]
		}
	}

	const handleOpenDropdown = (term = searchTerm) => {
		if (
			!disabled &&
			(filterAccounts(term).length > 0 ||
				(allowCustomAccounts && isValidAddress(term)))
		) {
			setIsOpen(true)
		}
	}

	const handleSelect = (account: ImportedAccount) => {
		setSelectedAccount(account)
		onSelect?.(account)

		setIsOpen(false)
		setSearchTerm('')
		setIsInputFocused(false)
		inputRef.current?.blur()
	}

	useOutsideAlerter(dropdownRef, () => {
		setIsOpen(false)
		setSearchTerm('')
		setIsInputFocused(false)
	}, [containerClass, dropdownClass])

	const inputValue = isInputFocused ? searchTerm : selectedAccount?.name || ''

	return (
		<>
			{label && <AccountInput.Label label={label} />}
			<AccountInput.Container
				className={containerClass}
				ref={dropdownRef}
				disabled={disabled}
				listOpen={isOpen}
			>
				{!isInputFocused && !disabled && (
					<AccountInput.InactiveButton
						onClick={() => {
							handleOpenDropdown()
							inputRef.current?.focus()
						}}
					/>
				)}
				<span
					style={{
						opacity: isInputFocused || !selectedAccount ? 0.25 : 1,
						transition: 'opacity 0.15s',
						maxWidth: '2.75rem',
					}}
				>
					<Polkicon
						address={selectedAddress}
						fontSize="2.75rem"
						background="transparent"
					/>
				</span>
				<AccountInput.InnerLeft>
					<AccountInput.Input
						ref={inputRef}
						disabled={disabled}
						placeholder={
							selectedAccount?.name ||
							placeholder ||
							t('searchAddress', { ns: 'app' })
						}
						value={inputValue}
						onChange={(e) => {
							if (disabled) return
							const newSearchTerm = e.target.value
							setSearchTerm(newSearchTerm)
							if (!isOpen) {
								handleOpenDropdown(newSearchTerm)
							}
						}}
						onFocus={() => {
							if (disabled) return
							setIsInputFocused(true)
							handleOpenDropdown()
						}}
						onBlur={() => {
							if (disabled) return
							setTimeout(() => {
								setIsInputFocused(false)
							}, 150)
						}}
					/>
					{!isInputFocused && selectedAccount && (
						<AccountInput.Address address={selectedAccount.address} />
					)}
				</AccountInput.InnerLeft>
				{!isInputFocused && selectedAccount && (
					<AccountInput.InnerRight>
						<div>
							<AccountInput.Balance
								label={t('free', { ns: 'modals' })}
								value={new BigNumber(planckToUnit(transferableBalance, units))
									.decimalPlaces(3)
									.toFormat()}
								unit={unit}
							/>
						</div>
						<div>
							<AccountSourceIcon source={selectedAccount.source} />

							{!disabled && <AccountInput.Chevron />}
						</div>
					</AccountInput.InnerRight>
				)}
			</AccountInput.Container>

			{isOpen && dropdownPosition && filteredAccounts.length > 0 && (
				<RootPortal
					width={dropdownPosition.width}
					top={dropdownPosition.top}
					left={dropdownPosition.left}
				>
					<AccountInput.ListContainer
						ref={menuRef}
						className={dropdownClass}
						ariaLabel={
							label || placeholder || t('selectAccount', { ns: 'app' })
						}
					>
						<SimpleBar style={{ maxHeight: '300px' }}>
							{filteredAccounts.map((account) => (
								<AccountInput.ListItem
									account={account}
									isSelected={
										selectedAccount?.address === account.address &&
										selectedAccount?.source === account.source
									}
									key={`${account.address}-${account.source}`}
									onClick={handleSelect}
								>
									<Polkicon
										address={account.address}
										fontSize="2.25rem"
										background="transparent"
									/>

									<AccountInput.InnerLeft>
										<AccountInput.ListName
											name={account.name || ellipsisFn(account.address, 6)}
										/>
										<AccountInput.Address address={account.address} />
									</AccountInput.InnerLeft>
									<AccountSourceIcon source={account.source} />
								</AccountInput.ListItem>
							))}
						</SimpleBar>
					</AccountInput.ListContainer>
				</RootPortal>
			)}
		</>
	)
}
