// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useDataResource } from 'data-gate/react'
import {
	nominatorRewardTrend,
	poolRewardTrend,
} from 'data-gate/resources/rewards'
import { getPoolMembership } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useStaking } from 'hooks/useStaking'
import { Ticker } from 'library/StatCards/Ticker'
import { useTranslation } from 'react-i18next'

export const RewardTrend = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { activeEra } = useApi()
	const { isBonding } = useStaking()
	const { erasPerDay } = useErasPerDay()
	const { activeAddress } = useActiveAccount()

	const { unit, units } = getStakingChainData(network)
	const { membership } = getPoolMembership(activeAddress)
	const eras = erasPerDay * 30
	// NOTE: 30 day duration in seconds
	const duration = 2592000

	const who =
		(isBonding || membership) && activeEra.index > 0 ? activeAddress || '' : ''
	const nominator = useDataResource(
		nominatorRewardTrend(membership ? '' : who, eras),
	)
	const pool = useDataResource(poolRewardTrend(membership ? who : '', duration))
	const rewardTrend = membership
		? pool.data?.poolRewardTrend
		: nominator.data?.nominatorRewardTrend

	// Format the reward trend data
	let value = '0'
	let direction: 'up' | 'down' | undefined
	let changePercent = '0'
	if (rewardTrend) {
		const { reward, change } = rewardTrend
		value = reward
		direction = Number(change.percent) > 0 ? 'up' : 'down'
		changePercent = new BigNumber(change.percent).toFormat(2)
	}

	const params = {
		label: t('last30DayReward'),
		value: new BigNumber(planckToUnit(value, units))
			.decimalPlaces(3)
			.toFormat(),
		decimals: 3,
		unit,
		direction,
		changePercent,
	}
	return <Ticker {...params} />
}
