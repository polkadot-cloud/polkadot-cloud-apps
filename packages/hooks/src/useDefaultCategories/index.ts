// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { compareAccounts } from 'utils'
import type { AccountListCategory } from '../useStakingAccountCategories'

export const useDefaultCategories = (): AccountListCategory[] => {
	const { accounts } = useImportedAccounts()

	return [
		{
			key: 'default',
			items: [...accounts]
				.sort(compareAccounts)
				.map(({ address, source }) => ({ address, source })),
		},
	]
}
