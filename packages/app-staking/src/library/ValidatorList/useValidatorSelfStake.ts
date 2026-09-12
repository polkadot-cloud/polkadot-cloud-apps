// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import type { ValidatorOverview } from 'types'
import { isMaxSelfStake, planckToUnitBn } from 'utils'

export const useValidatorSelfStake = (
	overview: ValidatorOverview | null | undefined,
	units: number,
) => {
	const hardCapSelfStake = useHardCapSelfStake()
	const selfStakePlanck = overview ? new BigNumber(overview.own) : undefined

	return {
		selfStake: selfStakePlanck
			? planckToUnitBn(selfStakePlanck, units)
			: undefined,
		selfStakeMax: isMaxSelfStake(selfStakePlanck, hardCapSelfStake),
	}
}
