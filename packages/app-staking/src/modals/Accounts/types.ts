// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Proxy } from '@polkadot-cloud/connect-proxies'
import type { PoolMembership } from 'types'

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

export interface AccountInPoolProps extends PoolMembership {
	source: string
	delegates?: Proxy
}

export interface AccountItemProps {
	address: string
	source: string
	delegates?: Proxy
}

export type AccountNominatingInPoolProps = AccountItemProps & AccountInPoolProps
