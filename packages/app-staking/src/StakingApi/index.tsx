// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Props } from './types'
import { UnclaimedRewardsApi } from './UnclaimedRewardsApi'

export const StakingApi = (props: Props) => {
	return <UnclaimedRewardsApi {...props} />
}
