// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUsb } from '@fortawesome/free-brands-svg-icons'
import type { LedgerResponse } from '@polkadot-cloud/connect-ledger'
import {
	getLedgerDeviceName,
	useLedger,
	useLedgerAccounts,
} from '@polkadot-cloud/connect-ledger'
import { useEffectIgnoreInitial } from '@w3ux/hooks'
import { Polkicon } from '@w3ux/react-polkicon'
import type { HardwareAccount } from '@w3ux/types'
import { setStateWithRef } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LedgerAddress } from 'types'
import { ButtonText } from 'ui-buttons'
import { AccountImport } from 'ui-core/base'
import { Close, useOverlay } from 'ui-overlay'
import { Groups } from './Groups'
import { getLedgerDeviceIcon } from './icons'
import { useLedgerDeviceGroups } from './useLedgerDeviceGroups'

export const Ledger = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const {
		addLedgerAccount,
		removeLedgerAccount,
		renameLedgerAccount,
		ledgerAccountExists,
		getLedgerAccounts,
	} = useLedgerAccounts(network)
	const {
		getFeedbackCode,
		setFeedbackCode,
		isExecuting,
		setStatusCode,
		handleUnmount,
		resetStatusCode,
		handleGetAddress,
		transportResponse,
		handleResetLedgerTask,
	} = useLedger()
	const { setModalResize } = useOverlay().modal

	const initialAddresses = getLedgerAccounts()
	const storedLedgerAccounts = getLedgerAccounts()

	// Store addresses retrieved from Ledger device. Defaults to local addresses
	const [addresses, setAddresses] =
		useState<HardwareAccount[]>(initialAddresses)
	const addressesRef = useRef(addresses)
	const [pendingRename, setPendingRename] = useState<{
		address: string
		name: string
	} | null>(null)
	const {
		activeAddresses,
		activeGroup,
		activeGroupDeviceModel,
		addressGroups,
		canAddGroup,
		ensureGroupMatchesDevice,
		nextAddressIndex,
		onAddGroup,
		onGroupChange,
		onImportSuccess,
		onResetActiveGroup,
	} = useLedgerDeviceGroups({
		addresses,
		addressesRef,
		setAddresses,
	})

	// Handle exist check for a ledger address. Checks whether the provided address has already been
	// imported for this source and network combination
	const handleExists = (address: string) => ledgerAccountExists(address)

	// Handle renaming a ledger address for an imported address. Renames the provided address for this
	// source and network combination
	const handleRename = (address: string, newName: string) => {
		renameLedgerAccount(address, newName)
	}

	// Handle removing a ledger address. Removes provided address from imported accounts and local
	// state for ui syncing
	const handleRemove = (address: string) => {
		if (confirm(t('areYouSure', { ns: 'app' }))) {
			removeLedgerAccount(address)
			setStateWithRef(
				[...addressesRef.current.filter((a) => a.address !== address)],
				setAddresses,
				addressesRef,
			)
		}
	}

	// Ledger address getter
	const onGetAddress = async () => {
		const matchesGroup = await ensureGroupMatchesDevice()
		if (!matchesGroup) {
			return
		}
		await handleGetAddress(nextAddressIndex, getStakingChainData(network).ss58)
	}

	// Handle new Ledger status report
	const handleLedgerStatusResponse = (response: LedgerResponse) => {
		if (!response) {
			return
		}
		const { ack, statusCode, body, device, options } = response
		setStatusCode({ ack, statusCode })

		if (statusCode === 'ReceivedAddress') {
			const responseDeviceModel = device?.deviceModel ?? 'unknown'
			const deviceName = getLedgerDeviceName(responseDeviceModel)
			const accountNumber = activeAddresses.length + 1
			const defaultName = `${deviceName} ${accountNumber}`

			const existingAddresses = new Set(
				addressesRef.current.map((account) => account.address),
			)
			const newAddress = body
				.filter((item: LedgerAddress) => {
					const { address } = item
					if (existingAddresses.has(address)) {
						return false
					}
					return !ledgerAccountExists(address)
				})
				.map(({ pubKey, address }: LedgerAddress) => ({
					index: options.accountIndex,
					pubKey,
					address,
					name: defaultName,
					network,
					group: activeGroup,
				}))

			if (newAddress.length > 0) {
				setStateWithRef(
					[...addressesRef.current, ...newAddress],
					setAddresses,
					addressesRef,
				)
				addLedgerAccount(
					activeGroup,
					newAddress[0].address,
					options.accountIndex,
				)
				setPendingRename({
					address: newAddress[0].address,
					name: defaultName,
				})
				onImportSuccess({
					accountIndex: options.accountIndex,
					address: newAddress[0].address,
					deviceModel: responseDeviceModel,
				})
			} else if (body.length > 0) {
				setFeedbackCode('accountAlreadyImportedOtherDevice')
			}
			resetStatusCode()
		}
	}

	// Get last saved ledger feedback code
	const feedback = getFeedbackCode()

	// Listen for new Ledger status reports
	useEffectIgnoreInitial(() => {
		handleLedgerStatusResponse(transportResponse)
	}, [transportResponse])

	useEffect(() => {
		if (!pendingRename) {
			return
		}
		const importedAccount = storedLedgerAccounts.find(
			(account) => account.address === pendingRename.address,
		)
		if (!importedAccount) {
			return
		}
		if (importedAccount.name !== pendingRename.name) {
			renameLedgerAccount(pendingRename.address, pendingRename.name)
		}
		setPendingRename(null)
	}, [network, pendingRename, renameLedgerAccount, storedLedgerAccounts])

	// Tidy up context state when this component is no longer mounted
	useEffect(
		() => () => {
			handleUnmount()
		},
		[],
	)

	// Resize modal on account length / feedback change
	useEffect(() => {
		setModalResize()
	}, [activeAddresses.length, activeGroup, feedback?.message])

	const maybeFeedback = feedback?.message
	const minListHeight = '20rem'

	// Resolve device-specific icon (falls back to generic Ledger logo)
	const DeviceIcon = getLedgerDeviceIcon(activeGroupDeviceModel)

	return (
		<>
			<Close />
			{addressGroups.length >= 1 && (
				<Groups
					activeGroup={activeGroup}
					addressGroups={addressGroups}
					canAddGroup={canAddGroup}
					onGroupChange={onGroupChange}
					onAddGroup={onAddGroup}
				/>
			)}
			<AccountImport.Header
				Logo={<DeviceIcon />}
				title={getLedgerDeviceName(activeGroupDeviceModel)}
				websiteText="ledger.com"
				websiteUrl="https://ledger.com"
				offsetChildren
				marginY
			>
				{activeAddresses.length > 0 && (
					<span>
						<ButtonText
							text={t('reset', { ns: 'app' })}
							onClick={() => {
								if (confirm(t('areYouSure', { ns: 'app' }))) {
									onResetActiveGroup()
								}
							}}
						/>
					</span>
				)}
				<span>
					<ButtonText
						text={
							isExecuting
								? t('cancel', { ns: 'app' })
								: t('importAnotherAccount', { ns: 'modals' })
						}
						iconLeft={faUsb}
						onClick={async () => {
							if (!isExecuting) {
								await onGetAddress()
							} else {
								handleResetLedgerTask()
							}
						}}
					/>
				</span>
			</AccountImport.Header>
			{!!maybeFeedback && (
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<h3 style={{ padding: '1rem 0 2rem 0' }}>
						{t(String(feedback?.message), {
							ns: 'app',
							...feedback?.params,
						})}
					</h3>
				</div>
			)}
			<div style={{ minHeight: minListHeight }}>
				{activeAddresses.length === 0 && !maybeFeedback && (
					<AccountImport.Empty>
						<h3>{t('importedAccount', { count: 0, ns: 'modals' })}</h3>
					</AccountImport.Empty>
				)}
				{activeAddresses.length > 0 &&
					activeAddresses.map(({ name, address }) => (
						<AccountImport.Item
							key={`ledger_imported_${address}`}
							address={address}
							last={
								address === activeAddresses[activeAddresses.length - 1]?.address
							}
							initial={name}
							Identicon={<Polkicon address={address} fontSize="3.3rem" />}
							existsHandler={handleExists}
							renameHandler={handleRename}
							onRemove={handleRemove}
						/>
					))}
			</div>
		</>
	)
}
