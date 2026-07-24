// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId } from 'types'
import { getFeeReserve } from 'utils'

export const getLocalFeeReserve = (
	address: string | null | undefined,
	defaultReserve: bigint,
	{ network }: { network: NetworkId; units: number },
): bigint => {
	try {
		const reserves = JSON.parse(
			localStorage.getItem('reserve_balances') ?? '{}',
		)
		return getFeeReserve(reserves?.[network]?.[address || ''], defaultReserve)
	} catch {
		return defaultReserve
	}
}

export const setLocalFeeReserve = (
	address: string | null | undefined,
	amount: bigint,
	network: NetworkId,
): void => {
	if (!address) {
		return
	}
	try {
		const newReserves = JSON.parse(
			localStorage.getItem('reserve_balances') ?? '{}',
		)
		const networkReserves = newReserves?.[network] ?? {}
		networkReserves[address] = amount.toString()
		newReserves[network] = networkReserves
		localStorage.setItem('reserve_balances', JSON.stringify(newReserves))
	} catch {
		localStorage.removeItem('reserve_balances')
	}
}
