// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { UnclaimedRewards } from 'plugin-staking-api/types'

export interface PayoutsHookInterface {
	unclaimedRewards: UnclaimedRewards
	setUnclaimedRewards: (unclaimedRewards: UnclaimedRewards) => void
}
