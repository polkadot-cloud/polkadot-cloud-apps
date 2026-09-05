// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { type Proxy, useProxies } from '@polkadot-cloud/connect-proxies'
import { useBalances } from '../useBalances'
import { useValidators } from '../useValidators'

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
	const { isValidator } = useValidators()
	const { accounts } = useImportedAccounts()
	const { getStakingLedger, getPoolMembership } = useBalances()

	const validating: AccountCategoryItem[] = []
	const nominating: AccountCategoryItem[] = []
	const inPool: AccountCategoryItem[] = []
	const nominatingAndPool: AccountCategoryItem[] = []
	const notStaking: AccountCategoryItem[] = []

	for (const { address, source } of accounts) {
		const { ledger } = getStakingLedger(address)
		const { membership } = getPoolMembership(address)
		const delegates = getDelegates(address)
		let category: AccountCategoryItem[]
		let itemAddress = address

		if (isValidator(address)) {
			category = validating
		} else if (ledger && membership) {
			category = nominatingAndPool
		} else if (ledger) {
			category = nominating
		} else if (membership) {
			category = inPool
			itemAddress = membership.address
		} else {
			category = notStaking
		}

		if (!hasAccount(category, itemAddress, source)) {
			category.push({ address: itemAddress, source, delegates })
		}
	}

	return [
		{ key: 'validating', labelKey: 'validating', items: validating },
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
