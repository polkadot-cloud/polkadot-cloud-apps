// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import {
	defaultStablecoinBalances,
	getStablecoinBalancesState,
	type StablecoinBalancesState,
	stablecoinBalances$,
} from 'global-bus'
import { useCallback, useSyncExternalStore } from 'react'
import type { FeeAssetSymbol, StablecoinChainId, StablecoinSymbol } from 'types'
import { createObservableStore } from 'utils'
import { useApi } from '../useApi'

type StablecoinTotalFilter = {
	chain?: StablecoinChainId
	symbol?: StablecoinSymbol
}

const stablecoinBalancesStore = createObservableStore<StablecoinBalancesState>(
	stablecoinBalances$,
	getStablecoinBalancesState,
)

export const useStablecoinBalances = (address?: string | null) => {
	const { serviceApi } = useApi()
	const balanceState = useSyncExternalStore(
		stablecoinBalancesStore.subscribe,
		stablecoinBalancesStore.getSnapshot,
		stablecoinBalancesStore.getSnapshot,
	)
	const { balances, status } = address
		? balanceState[address] || defaultStablecoinBalances
		: defaultStablecoinBalances

	const refresh = useCallback(async () => {
		if (address) {
			await serviceApi.stablecoins.query
				.balances(address)
				.catch(() => undefined)
		}
	}, [address, serviceApi])

	const getBalance = useCallback(
		(chain: StablecoinChainId, symbol: FeeAssetSymbol) =>
			balances.find(
				(balance) => balance.chain === chain && balance.symbol === symbol,
			),
		[balances],
	)

	const getBalanceUnit = useCallback(
		(chain: StablecoinChainId, symbol: FeeAssetSymbol) => {
			const balance = getBalance(chain, symbol)
			return balance
				? new BigNumber(planckToUnit(balance.free, balance.decimals))
				: new BigNumber(0)
		},
		[getBalance],
	)

	const getStablecoinTotal = useCallback(
		({ chain, symbol }: StablecoinTotalFilter = {}) =>
			balances.reduce((total, balance) => {
				if (
					balance.symbol === 'DOT' ||
					(chain && balance.chain !== chain) ||
					(symbol && balance.symbol !== symbol)
				) {
					return total
				}

				return total.plus(planckToUnit(balance.free, balance.decimals))
			}, new BigNumber(0)),
		[balances],
	)

	const getStablecoinShare = useCallback(
		(filter: StablecoinTotalFilter = {}) => {
			const total = getStablecoinTotal()
			return total.isZero()
				? 0
				: getStablecoinTotal(filter)
						.dividedBy(total)
						.multipliedBy(100)
						.decimalPlaces(2)
						.toNumber()
		},
		[getStablecoinTotal],
	)

	return {
		balances,
		getBalance,
		getBalanceUnit,
		getStablecoinShare,
		getStablecoinTotal,
		loading: Boolean(address) && (status === 'idle' || status === 'syncing'),
		refresh,
	}
}
