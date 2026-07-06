// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChain, getStakingChainData } from 'consts/util'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import type { AnnouncementItem } from 'library/Announcements/types'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'

export const Announcements = ({ items }: { items: AnnouncementItem[] }) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { getChainSpec } = useApi()
	const { activePool } = useActivePool()

	const { unit, units } = getStakingChainData(network)
	const { rewardAccountBalance } = activePool || {}
	const { totalRewardsClaimed } = activePool?.rewardPool || {}
	const { existentialDeposit } = getChainSpec(getStakingChain(network))

	// calculate the latest reward account balance
	const rewardPoolBalance = BigNumber.max(
		0,
		new BigNumber(rewardAccountBalance || 0).minus(existentialDeposit),
	)
	const rewardBalance = planckToUnitBn(rewardPoolBalance, units)

	// calculate total rewards claimed
	const rewardsClaimed = planckToUnitBn(
		totalRewardsClaimed ? new BigNumber(totalRewardsClaimed) : new BigNumber(0),
		units,
	)

	const announcements: Array<AnnouncementItem | null> = [
		...items.map(({ label, value, button, helpKey }) => {
			if (!value || value === '0' || value === '0%') {
				return null
			}
			return { label, value, button, helpKey }
		}),
	]

	// Total rewards claimed
	const rewardsClaimedValue = rewardsClaimed.decimalPlaces(3).toFormat()
	announcements.push(
		rewardsClaimedValue === '0'
			? null
			: {
					label: t('totalClaimed'),
					value: `${rewardsClaimedValue} ${unit}`,
				},
	)

	// Available to claim
	const rewardBalanceValue = rewardBalance.decimalPlaces(3).toFormat()
	announcements.push(
		rewardBalanceValue === '0'
			? null
			: {
					label: t('availableToClaim', { unit }),
					value: `${rewardBalanceValue} ${unit}`,
				},
	)

	return <AnnouncementsList items={announcements} />
}
