// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils'
import { getStablecoinFeeAssets } from 'consts/stablecoins'
import { useDefaultCategories } from '../useDefaultCategories'
import { useStablecoinBalancesState } from '../useStablecoinBalances'
import type { AccountListCategory } from '../useStakingAccountCategories'

const supportedAssets = new Set(getStablecoinFeeAssets('statemint'))

const categoryOrder = [
	'withBalances',
	'syncingBalances',
	'balanceUnavailable',
	'noBalance',
] as const

type AccountCategoryKey = (typeof categoryOrder)[number]

export const useStablecoinAccountCategories = (): AccountListCategory[] => {
	const categories = useDefaultCategories()
	const balances = useStablecoinBalancesState()

	const ranked = categories
		.flatMap(({ items }) => items)
		.map((account) => {
			const entry = balances[account.address]
			const holdings = (entry?.balances ?? []).filter(
				({ chain, symbol }) =>
					chain === 'statemint' &&
					symbol !== 'DOT' &&
					supportedAssets.has(symbol),
			)
			const hasBalance = holdings.some(({ free }) => free > 0n)
			const hasSnapshot = entry?.status === 'synced' || holdings.length > 0
			const category: AccountCategoryKey = hasBalance
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
			return { account, category, value }
		})
	// Keep the original name order for equal values and empty accounts.
	ranked.sort((a, b) => b.value - a.value)
	return categoryOrder.map((key) => ({
		key,
		labelKey: key,
		items: ranked
			.filter(({ category }) => category === key)
			.map(({ account }) => account),
	}))
}
