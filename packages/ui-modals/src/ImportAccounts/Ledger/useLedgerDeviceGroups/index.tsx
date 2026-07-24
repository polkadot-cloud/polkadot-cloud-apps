// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerDeviceModel } from '@polkadot-cloud/connect-ledger'
import { useLedger, useLedgerAccounts } from '@polkadot-cloud/connect-ledger'
import type { HardwareAccount } from '@w3ux/types'
import { setStateWithRef } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getStoredGroupDeviceModels, setStoredGroupDeviceModels } from './local'
import type { GroupAnchor, UseLedgerDeviceGroupsProps } from './types'

// Manages the Ledger import modal's per-device grouping state, including:
// - active group selection
// - per-group device metadata
// - group anchors used to verify the connected Ledger matches the selected group
// - add / reset group workflows
export const useLedgerDeviceGroups = ({
	addresses,
	addressesRef,
	setAddresses,
}: UseLedgerDeviceGroupsProps) => {
	const { network } = useNetwork()
	const { removeLedgerAccount } = useLedgerAccounts(network)
	const { fetchLedgerAddress, resetStatusCode, setFeedbackCode } = useLedger()

	const { ss58 } = getStakingChainData(network)

	// Each group keeps a stable "anchor" account so we can verify future device connections against a
	// known address from that same Ledger.
	const groupAnchorsRef = useRef<Record<number, GroupAnchor>>({})

	// Group ids are 1-based and default to the first Ledger device slot.
	const [activeGroup, setActiveGroup] = useState<number>(1)
	const [groups, setGroups] = useState<number[]>(() => {
		const initialGroups = Array.from(
			new Set(addresses.map((account) => account.group ?? 1)),
		)
		return initialGroups.length > 0 ? initialGroups.sort((a, b) => a - b) : [1]
	})

	// Persist the last known Ledger model for each group so the UI can render the correct device icon
	// and name even when another Ledger was connected later.
	const [groupDeviceModels, setGroupDeviceModels] = useState<
		Record<number, LedgerDeviceModel>
	>(() => getStoredGroupDeviceModels(network))

	// Bucket imported Ledger accounts by their assigned device group.
	const groupedAddresses = useMemo(() => {
		const grouped: Record<number, HardwareAccount[]> = {}
		addresses.forEach((account) => {
			const group = account.group ?? 1
			if (!grouped[group]) {
				grouped[group] = []
			}
			grouped[group].push(account)
		})
		return grouped
	}, [addresses])

	// Keep groups sorted so selection and "latest group" logic stay predictable.
	const addressGroups = useMemo(
		() => [...groups].sort((a, b) => a - b),
		[groups],
	)

	// Derived state for the currently selected device group.
	const activeAddresses = groupedAddresses[activeGroup] ?? []
	const activeGroupDeviceModel = groupDeviceModels[activeGroup] ?? 'unknown'
	const nextAddressIndex =
		activeAddresses.length > 0
			? activeAddresses[activeAddresses.length - 1].index + 1
			: 0

	// Only allow creating another group when the latest group already has at least one account.
	const canAddGroup = useMemo(() => {
		const latestGroup = addressGroups[addressGroups.length - 1] ?? 1
		const latestGroupIsEmpty =
			(groupedAddresses[latestGroup]?.length ?? 0) === 0
		return !latestGroupIsEmpty
	}, [addressGroups, groupedAddresses])

	// Store the detected Ledger model for a group after a successful verification/import.
	const persistGroupDeviceModel = (
		group: number,
		model?: LedgerDeviceModel,
	) => {
		if (!model || model === 'unknown') {
			return
		}
		setGroupDeviceModels((prev) => {
			if (prev[group] === model) {
				return prev
			}
			const next = { ...prev, [group]: model }
			setStoredGroupDeviceModels(network, next)
			return next
		})
	}

	// Clear any persisted device metadata for a group when that group is reset.
	const clearGroupDeviceModel = (group: number) => {
		setGroupDeviceModels((prev) => {
			if (!(group in prev)) {
				return prev
			}
			const next = { ...prev }
			delete next[group]
			setStoredGroupDeviceModels(network, next)
			return next
		})
	}

	// Before importing another address into the selected group, confirm the currently connected
	// Ledger matches that group's anchor account. This prevents mixing accounts from different
	// physical devices into the same group.
	const ensureGroupMatchesDevice = async () => {
		const groupAccounts = groupedAddresses[activeGroup] ?? []
		const cachedAnchor = groupAnchorsRef.current[activeGroup] ?? null

		// A new empty group has no anchor yet, so use account `0` as the initial device fingerprint.
		if (!cachedAnchor && groupAccounts.length === 0) {
			const anchorResult = await fetchLedgerAddress(0, ss58)
			if (!anchorResult?.address) {
				return false
			}
			persistGroupDeviceModel(activeGroup, anchorResult.deviceModel)
			groupAnchorsRef.current[activeGroup] = {
				index: 0,
				address: anchorResult.address,
			}
			return true
		}

		let anchor = cachedAnchor
		if (!anchor) {
			// Rebuild the anchor from the group's lowest-index imported account if needed.
			const [firstAccount, ...rest] = groupAccounts
			const anchorAccount = rest.reduce(
				(min, account) => (account.index < min.index ? account : min),
				firstAccount,
			)
			anchor = {
				index: anchorAccount.index,
				address: anchorAccount.address,
			}
			groupAnchorsRef.current[activeGroup] = anchor
		}

		const anchorResult = await fetchLedgerAddress(anchor.index, ss58)
		if (!anchorResult?.address) {
			return false
		}
		if (anchorResult.address !== anchor.address) {
			setFeedbackCode('accountAlreadyImportedOtherDevice')
			return false
		}
		persistGroupDeviceModel(activeGroup, anchorResult.deviceModel)
		return true
	}

	// Called after a successful import so group metadata stays in sync with the new account.
	const onImportSuccess = ({
		accountIndex,
		address,
		deviceModel: importedDeviceModel,
	}: {
		accountIndex: number
		address: string
		deviceModel?: LedgerDeviceModel
	}) => {
		persistGroupDeviceModel(activeGroup, importedDeviceModel)
		if (!groupAnchorsRef.current[activeGroup]) {
			groupAnchorsRef.current[activeGroup] = {
				index: accountIndex,
				address,
			}
		}
	}

	// Remove every account in the active group while preserving accounts from other groups.
	const onResetActiveGroup = () => {
		delete groupAnchorsRef.current[activeGroup]
		clearGroupDeviceModel(activeGroup)
		setFeedbackCode(null)
		resetStatusCode()

		// Clear only the active group's accounts and keep the group itself available so the
		// next import stays scoped to this device slot instead of jumping to another group.
		const nextAddresses = addressesRef.current.filter(
			(account) => account.group !== activeGroup,
		)

		activeAddresses.forEach((account) => {
			removeLedgerAccount(account.address)
		})
		setStateWithRef(nextAddresses, setAddresses, addressesRef)
	}

	// Allocate the next 1-based group id and switch the UI to that new device slot.
	const onAddGroup = () => {
		if (!canAddGroup) {
			return
		}
		setGroups((prev) => {
			const next = (prev.length ? Math.max(...prev) : 0) + 1
			setActiveGroup(next)
			return [...prev, next]
		})
	}

	// Reload persisted group metadata when the selected network changes.
	useEffect(() => {
		setGroupDeviceModels(getStoredGroupDeviceModels(network))
	}, [network])

	// Keep the group list aligned with whatever account groups currently exist in local state.
	useEffect(() => {
		const derivedGroups = Array.from(
			new Set(addresses.map((account) => account.group ?? 1)),
		)
		if (derivedGroups.length === 0) {
			return
		}
		setGroups((prev) => {
			const merged = Array.from(new Set([...prev, ...derivedGroups])).sort(
				(a, b) => a - b,
			)
			const unchanged =
				merged.length === prev.length &&
				merged.every((value, index) => value === prev[index])
			return unchanged ? prev : merged
		})
	}, [addresses])

	// Backfill anchors for any populated groups that do not yet have one cached.
	useEffect(() => {
		Object.entries(groupedAddresses).forEach(([groupKey, accounts]) => {
			if (accounts.length === 0) {
				return
			}
			const group = Number(groupKey)
			if (groupAnchorsRef.current[group]) {
				return
			}
			const [firstAccount, ...rest] = accounts
			const anchorAccount = rest.reduce(
				(min, account) => (account.index < min.index ? account : min),
				firstAccount,
			)
			groupAnchorsRef.current[group] = {
				index: anchorAccount.index,
				address: anchorAccount.address,
			}
		})
	}, [groupedAddresses])

	// Drop cached anchors for groups that no longer contain any accounts.
	useEffect(() => {
		Object.keys(groupAnchorsRef.current).forEach((groupKey) => {
			const group = Number(groupKey)
			const count = groupedAddresses[group]?.length ?? 0
			if (count === 0) {
				delete groupAnchorsRef.current[group]
			}
		})
	}, [groupedAddresses])

	// Keep the selected group valid as groups are added or removed.
	useEffect(() => {
		if (addressGroups.length === 0) {
			if (activeGroup !== 1) {
				setActiveGroup(1)
			}
			return
		}
		if (!addressGroups.includes(activeGroup)) {
			setActiveGroup(addressGroups[0])
		}
	}, [addressGroups, activeGroup])

	return {
		activeAddresses,
		activeGroup,
		activeGroupDeviceModel,
		addressGroups,
		canAddGroup,
		ensureGroupMatchesDevice,
		nextAddressIndex,
		onAddGroup,
		onGroupChange: setActiveGroup,
		onImportSuccess,
		onResetActiveGroup,
	}
}
