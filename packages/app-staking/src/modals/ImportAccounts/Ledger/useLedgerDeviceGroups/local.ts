// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerDeviceModel } from '@polkadot-cloud/connect-ledger'
import { ledgerDeviceGroupsKey } from 'consts'

export const getStoredGroupDeviceModels = (
	network: string,
): Record<number, LedgerDeviceModel> => {
	try {
		const stored = localStorage.getItem(ledgerDeviceGroupsKey(network))
		return stored
			? (JSON.parse(stored) as Record<number, LedgerDeviceModel>)
			: {}
	} catch {
		return {}
	}
}

export const setStoredGroupDeviceModels = (
	network: string,
	groupDeviceModels: Record<number, LedgerDeviceModel>,
) => {
	if (Object.keys(groupDeviceModels).length === 0) {
		localStorage.removeItem(ledgerDeviceGroupsKey(network))
		return
	}
	localStorage.setItem(
		ledgerDeviceGroupsKey(network),
		JSON.stringify(groupDeviceModels),
	)
}
