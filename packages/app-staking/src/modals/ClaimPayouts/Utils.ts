// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { ValidatorUnclaimedReward } from 'plugin-staking-api/types'

export const getTotalPayout = (
	validators: ValidatorUnclaimedReward[],
): BigNumber =>
	validators.reduce(
		(acc: BigNumber, { reward }: ValidatorUnclaimedReward) => acc.plus(reward),
		new BigNumber(0),
	)
