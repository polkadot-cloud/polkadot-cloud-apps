// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils'
import { getStablecoinFeeAssets } from 'consts/stablecoins'
import { useStablecoinBalancesState } from 'hooks'
import { useMemo } from 'react'
import type { ImportedAccount } from 'types'

const supportedAssets = new Set(getStablecoinFeeAssets('statemint'))
const groupOrder = [
	'withBalances',
	'syncingBalances',
	'balanceUnavailable',
	'noBalance',
] as const

type AccountGroupKey = (typeof groupOrder)[number]

export const useAccountGroups = (accounts: ImportedAccount[]) => {
	const balances = useStablecoinBalancesState()

	return useMemo(() => {
		const ranked = accounts.map((account) => {
			const entry = balances[account.address]
			const holdings = (entry?.balances ?? []).filter(
				({ chain, symbol }) =>
					chain === 'statemint' &&
					symbol !== 'DOT' &&
					supportedAssets.has(symbol),
			)
			const hasBalance = holdings.some(({ free }) => free > 0n)
			const hasSnapshot = entry?.status === 'synced' || holdings.length > 0
			const group: AccountGroupKey = hasBalance
				? 'withBalances'
				: hasSnapshot
					? 'noBalance'
					: entry?.status === 'error'
						? 'balanceUnavailable'
						: 'syncingBalances'
			const value = holdings.reduce(
				(total, { free, decimals }) =>
					total + Number(planckToUnit(free, decimals)),
				0,
			)
			return { account, group, value }
		})
		// Keep the original name order for equal values and empty accounts.
		ranked.sort((a, b) => b.value - a.value)
		return groupOrder
			.map((key) => ({
				key,
				accounts: ranked
					.filter(({ group }) => group === key)
					.map(({ account }) => account),
			}))
			.filter((group) => group.accounts.length > 0)
	}, [accounts, balances])
}
