// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { StablecoinBalance } from 'types'

export type StablecoinBalancesStatus = 'idle' | 'syncing' | 'synced' | 'error'

export type StablecoinBalancesEntry = {
	balances: StablecoinBalance[]
	status: StablecoinBalancesStatus
	requestId?: number
}

export type StablecoinBalancesState = Record<string, StablecoinBalancesEntry>

export const _stablecoinBalances = new BehaviorSubject<StablecoinBalancesState>(
	{},
)
