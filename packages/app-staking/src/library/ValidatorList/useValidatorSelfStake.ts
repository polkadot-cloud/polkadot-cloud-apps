// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useEraStakers } from 'contexts/EraStakers'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import { isMaxSelfStake, planckToUnitBn } from 'utils'

export const useValidatorSelfStake = (address: string, units: number) => {
	const hardCapSelfStake = useHardCapSelfStake()
	const { getActiveValidator } = useEraStakers()
	const validatorOwnStake = getActiveValidator(address)?.own
	const selfStakePlanck =
		validatorOwnStake !== undefined
			? new BigNumber(validatorOwnStake)
			: undefined

	return {
		selfStake:
			selfStakePlanck !== undefined
				? planckToUnitBn(selfStakePlanck, units)
				: undefined,
		selfStakeMax: isMaxSelfStake(selfStakePlanck, hardCapSelfStake),
	}
}
