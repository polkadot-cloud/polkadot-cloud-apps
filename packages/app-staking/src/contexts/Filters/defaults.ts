// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FilterItem } from './types'

export const defaultIncludes: FilterItem[] = [
	{
		key: 'pools',
		filters: ['active'],
	},
]

export const defaultExcludes: FilterItem[] = [
	{
		key: 'pools',
		filters: ['locked', 'destroying'],
	},
]
