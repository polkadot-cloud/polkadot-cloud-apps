// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Proxy } from '@polkadot-cloud/connect-proxies'
import type {
	AccountCategoryItem,
	UseAccountListCategories,
} from 'hooks/useStakingAccountCategories'

export type {
	AccountCategoryItem,
	AccountListCategory,
	UseAccountListCategories,
} from 'hooks/useStakingAccountCategories'

export interface AccountsProps {
	useCategories?: UseAccountListCategories
}

export interface AccountButtonProps {
	address: string
	source: string
	label?: string[]
	asElement?: boolean
	delegator?: string
	noBorder?: boolean
	proxyType?: string
	transferableBalance?: bigint
}

export interface DelegatesProps {
	delegator: string
	source: string
	delegates: Proxy | undefined
}

export type AccountItemProps = AccountCategoryItem
