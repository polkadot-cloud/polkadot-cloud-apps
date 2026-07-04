// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { type Proxy, useProxies } from '@polkadot-cloud/connect-proxies'
import { useBalances } from '../useBalances'

export interface AccountCategoryItem {
	address: string
	source: string
	delegates?: Proxy
}

export interface AccountListCategory {
	key: string
	labelKey?: string
	items: AccountCategoryItem[]
}

export type UseAccountListCategories = () => AccountListCategory[]

const hasAccount = (
	items: AccountCategoryItem[],
	address: string,
	source: string,
) => items.some((item) => item.address === address && item.source === source)

export const useStakingAccountCategories = (): AccountListCategory[] => {
	const { getDelegates } = useProxies()
	const { accounts } = useImportedAccounts()
	const { getStakingLedger, getPoolMembership } = useBalances()

	const nominating: AccountCategoryItem[] = []
	const inPool: AccountCategoryItem[] = []
	const nominatingAndPool: AccountCategoryItem[] = []
	const notStaking: AccountCategoryItem[] = []

	for (const { address, source } of accounts) {
		const { ledger } = getStakingLedger(address)
		const { membership } = getPoolMembership(address)
		const delegates = getDelegates(address)

		const isNominating = !!ledger && !hasAccount(nominating, address, source)
		const isInPool = !!membership && !hasAccount(inPool, address, source)

		if (
			!isNominating &&
			!membership &&
			!hasAccount(notStaking, address, source)
		) {
			notStaking.push({ address, source, delegates })
			continue
		}

		if (
			isNominating &&
			isInPool &&
			membership &&
			!hasAccount(nominatingAndPool, address, source)
		) {
			nominatingAndPool.push({ address, source, delegates })
			continue
		}

		if (isNominating && !isInPool) {
			nominating.push({ address, source, delegates })
			continue
		}

		if (!isNominating && isInPool && membership) {
			inPool.push({ address: membership.address, source, delegates })
		}
	}

	return [
		{
			key: 'nominating_and_pool',
			labelKey: 'nominatingAndInPool',
			items: nominatingAndPool,
		},
		{ key: 'nominating', labelKey: 'nominating', items: nominating },
		{ key: 'in_pool', labelKey: 'inPool', items: inPool },
		{ key: 'not_staking', labelKey: 'notStaking', items: notStaking },
	]
}
