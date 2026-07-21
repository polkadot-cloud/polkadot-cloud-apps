// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useEffect, useState } from 'react'
import type {
	FeeAssetSymbol,
	StablecoinBalance,
	StablecoinChainId,
} from 'types'
import { useApi } from '../useApi'

export const useStablecoinBalances = (address?: string | null) => {
	const { serviceApi } = useApi()
	const [balances, setBalances] = useState<StablecoinBalance[]>([])
	const [loading, setLoading] = useState(false)

	// Allow consumers to manually re-query balances for the current address.
	const refresh = useCallback(async () => {
		if (!address) {
			setBalances([])
			return
		}

		setLoading(true)
		try {
			setBalances(await serviceApi.stablecoins.query.balances(address))
		} finally {
			setLoading(false)
		}
	}, [address, serviceApi])

	useEffect(() => {
		// Ignore async responses that resolve after the address changes or unmounts.
		let stale = false

		const fetchBalances = async () => {
			if (!address) {
				setBalances([])
				return
			}

			setLoading(true)
			try {
				const nextBalances =
					await serviceApi.stablecoins.query.balances(address)
				if (!stale) {
					setBalances(nextBalances)
				}
			} finally {
				if (!stale) {
					setLoading(false)
				}
			}
		}

		fetchBalances()

		return () => {
			stale = true
		}
	}, [address, serviceApi])

	// Read a cached balance for a specific chain and stablecoin symbol.
	const getBalance = useCallback(
		(chain: StablecoinChainId, symbol: FeeAssetSymbol) =>
			balances.find(
				(balance) => balance.chain === chain && balance.symbol === symbol,
			),
		[balances],
	)

	return {
		balances,
		getBalance,
		loading,
		refresh,
	}
}
