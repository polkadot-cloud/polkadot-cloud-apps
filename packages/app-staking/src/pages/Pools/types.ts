// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActivePool } from 'types'

export interface PoolAccountProps {
	address: string | null
	pool: ActivePool | undefined
}
