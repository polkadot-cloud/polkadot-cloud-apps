// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import { useOutsideAlerter } from '@w3ux/hooks'
import { Polkicon } from '@w3ux/react-polkicon'
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
import { ellipsisFn, planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util/chains'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { RootPortal } from 'library/RootPortal'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import type { ImportedAccount } from 'types'
import { AccountInput } from 'ui-core/input'
import { getTransferableBalance } from 'utils'
import type { AccountDropdownProps } from './types'
import { getAccountSourceIcon } from './util'

export const AccountDropdown = ({
	accounts,
	initialAccount,
	onSelect,
	onOpenChange,
	label,
	placeholder,
	disabled = false,
}: AccountDropdownProps) => {
	const { t } = useTranslation()
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { units, unit, ss58 } = getStakingChainData(network)

	// Generate unique ID for this component instance
	const instanceId = useId()
	const containerClass = `selected-account-${instanceId}`
	const dropdownClass = `account-input-dropdown-${instanceId}`

	// Manage internal state for selected account
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(
			initialAccount !== undefined
				? initialAccount
				: accounts.length > 0
					? accounts[0]
					: null,
		)

	// The currently selected address of this input
	const selectedAddress = selectedAccount?.address || ''

	// Fetch account balance asynchronously
	const [transferableBalance, setTransferableBalance] = useState<bigint>(0n)

	// Whether the dropdown is open
	const [isOpen, setIsOpen] = useState(false)

	// Search term for filtering accounts
	const [searchTerm, setSearchTerm] = useState('')

	// Whether the input is currently focused
	const [isInputFocused, setIsInputFocused] = useState(false)

	// Dropdown position calculated from button bounds
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

	// Calculate dropdown position when opened
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

	// Close dropdown on window resize to prevent position desync
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

	// Close dropdown on window scroll to prevent position desync
	useEffect(() => {
		const handleScroll = (e: Event) => {
			// Only close if the scroll target is not the dropdown menu
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
		window.addEventListener('scroll', handleScroll, true) // Use capture phase
		return () => {
			window.removeEventListener('scroll', handleScroll, true)
		}
	}, [isOpen])

	// Notify parent when dropdown state changes
	useEffect(() => {
		onOpenChange?.(isOpen)
	}, [isOpen, accounts.map((acc) => acc.address).join(',')])

	useEffect(() => {
		handleFetchBalance(selectedAddress)
	}, [selectedAddress])

	// Sync internal state when accounts change
	useEffect(() => {
		if (
			initialAccount === undefined &&
			!selectedAccount &&
			accounts.length > 0
		) {
			setSelectedAccount(accounts[0])
		}
	}, [accounts, selectedAccount, initialAccount])

	// Helper function to check if there will be any filtered accounts for a given search term
	const hasFilteredAccounts = (term: string): boolean => {
		// Check if any accounts match the search term
		const hasMatchingAccounts = accounts.some(
			(account) =>
				account.address.toLowerCase().includes(term.toLowerCase()) ||
				account.name?.toLowerCase().includes(term.toLowerCase()),
		)
		// Check if the term is a valid address (which would be added to the list)
		if (isValidAddress(term)) {
			return true
		}
		return hasMatchingAccounts
	}

	// Filter accounts based on search term
	let filteredAccounts = accounts.filter(
		(account) =>
			account.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
			account.name?.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	// If search term is a valid address and not already in accounts, add it as a temporary entry
	const validAddress = isValidAddress(searchTerm)
	if (validAddress) {
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

	// Handle opening of dropdown if there are accounts to choose from
	const handleOpenDropdown = (term = searchTerm) => {
		if (hasFilteredAccounts(term) && !disabled) {
			setIsOpen(true)
		}
	}

	// Handle account selection
	const handleSelect = (account: ImportedAccount) => {
		setSelectedAccount(account)
		// Call callback
		onSelect?.(account)

		setIsOpen(false)
		setSearchTerm('')
		setIsInputFocused(false)
		inputRef.current?.blur()
	}

	// Close dropdown menu if clicked outside of its container
	useOutsideAlerter(dropdownRef, () => {
		setIsOpen(false)
		setSearchTerm('')
		setIsInputFocused(false)
	}, [containerClass, dropdownClass])

	// Display value for the input field
	const inputValue = isInputFocused ? searchTerm : selectedAccount?.name || ''

	// Determine selected account source icon
	const SelectedSourceIcon = getAccountSourceIcon(selectedAccount?.source)

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
						address={selectedAccount?.address || ''}
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
							// Small delay to allow click events to fire
							setTimeout(() => {
								setIsInputFocused(false)
							}, 150)
						}}
					/>
					{!isInputFocused && selectedAccount && (
						<AccountInput.Address address={selectedAccount?.address || ''} />
					)}
				</AccountInput.InnerLeft>
				{!isInputFocused && selectedAccount && (
					<AccountInput.InnerRight>
						<div>
							<AccountInput.Balance
								label={t('free', { ns: 'modals' })}
								value={new BigNumber(
									planckToUnit(transferableBalance || 0n, units),
								)
									.decimalPlaces(3)
									.toFormat()}
								unit={unit}
							/>
						</div>
						<div>
							{SelectedSourceIcon !== undefined ? (
								<AccountInput.SourceIcon SvgIcon={SelectedSourceIcon} />
							) : selectedAccount?.source === 'external' ? (
								<AccountInput.SourceIcon faIcon={faGlasses} />
							) : null}

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
					<AccountInput.ListContainer ref={menuRef} className={dropdownClass}>
						<SimpleBar style={{ maxHeight: '300px' }}>
							{filteredAccounts.map((account) => {
								const SourceIcon = getAccountSourceIcon(account?.source)

								return (
									<AccountInput.ListItem
										account={account}
										isSelected={
											selectedAccount?.address === account.address &&
											selectedAccount?.source === account.source
										}
										key={`${account.address}-${account.source}`}
										onClick={handleSelect}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												handleSelect(account)
											}
										}}
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
										{SourceIcon !== undefined ? (
											<AccountInput.SourceIcon SvgIcon={SourceIcon} />
										) : account.source === 'external' ? (
											<AccountInput.SourceIcon faIcon={faGlasses} />
										) : null}
									</AccountInput.ListItem>
								)
							})}
						</SimpleBar>
					</AccountInput.ListContainer>
				</RootPortal>
			)}
		</>
	)
}
