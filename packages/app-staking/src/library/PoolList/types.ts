// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { BondedPool } from 'types'

export interface PoolListProps {
	allowMoreCols?: boolean
	allowSearch?: boolean
	allowListFormat?: boolean
	pools?: BondedPool[]
	itemsPerPage?: number
}
