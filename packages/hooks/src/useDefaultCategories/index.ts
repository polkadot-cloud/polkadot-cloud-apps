// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import type { AccountListCategory } from '../useStakingAccountCategories'

const accountSortValue = ({
	address,
	name,
}: {
	address: string
	name?: string
}) => name?.trim() || address

export const useDefaultCategories = (): AccountListCategory[] => {
	const { accounts } = useImportedAccounts()

	return [
		{
			key: 'default',
			items: [...accounts]
				.sort((a, b) => {
					const nameSort = accountSortValue(a).localeCompare(
						accountSortValue(b),
						undefined,
						{ sensitivity: 'base' },
					)

					if (nameSort !== 0) {
						return nameSort
					}

					return (
						a.address.localeCompare(b.address) ||
						a.source.localeCompare(b.source)
					)
				})
				.map(({ address, source }) => ({ address, source })),
		},
	]
}
