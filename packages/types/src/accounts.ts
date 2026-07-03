// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Account, AccountCommon } from '@w3ux/types'

export type MaybeAddress = string | null

export type ActiveAccount = {
	address: string
	source: string
} | null

export type ActiveProxy = {
	address: string
	source: string
	proxyType: string
}

export type LocalActiveProxies = Record<string, ActiveProxy>

export type ImportedAccount = Account | ExternalAccount

export type ExternalAccount = AccountCommon & {
	network: string
	addedBy: AccountAddedBy
}

export type AccountAddedBy = 'system' | 'user'

export type Proxies = {
	proxies: {
		delegate: string
		proxyType: string
		delay: number
	}[]
	deposit: bigint
}
