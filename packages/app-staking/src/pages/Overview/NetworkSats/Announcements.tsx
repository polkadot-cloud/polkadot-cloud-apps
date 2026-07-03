// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit, sortWithNull } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import type { AnnouncementItem } from 'library/Announcements/types'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { planckToUnitBn } from 'utils'

export const Announcements = ({ items }: { items: AnnouncementItem[] }) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { bondedPools } = useBondedPools()
	const { totalStaked, lastReward } = useStakingMetrics()

	const { unit, units } = getStakingChainData(network)
	const lastRewardUnit = new BigNumber(planckToUnit(lastReward || 0, units))

	let totalPoolPoints = new BigNumber(0)
	bondedPools.forEach((b: BondedPool) => {
		totalPoolPoints = totalPoolPoints.plus(b.points)
	})
	const totalPoolPointsUnit = planckToUnitBn(totalPoolPoints, units)

	const announcements: Array<
		(AnnouncementItem & { category?: string }) | null
	> = [
		...items.map(({ label, value, category, button, helpKey }) => {
			if (!value || value === '0' || value === '0%') {
				return null
			}
			return { label, value, category, button, helpKey }
		}),
	]

	// Total staked on the network
	if (totalStaked > 0n) {
		const totalStakedValue = new BigNumber(planckToUnit(totalStaked, units))
			.integerValue()
			.toFormat()
		announcements.push(
			totalStakedValue === '0'
				? null
				: {
						value: `${totalStakedValue} ${unit}`,
						label: t('totalStaked'),
						category: t('participation'),
					},
		)
	} else {
		announcements.push(null)
	}

	// Total locked in pools
	if (bondedPools.length) {
		const totalPoolPointsValue = totalPoolPointsUnit.integerValue().toFormat()
		announcements.push(
			totalPoolPointsValue === '0'
				? null
				: {
						value: `${totalPoolPointsValue} ${unit}`,
						label: t('bondedInPools', { networkUnit: unit }),
						category: t('pools'),
					},
		)
	} else {
		announcements.push(null)
	}

	// Last era payout
	if (lastRewardUnit.isGreaterThan(0)) {
		const lastRewardValue = lastRewardUnit.integerValue().toFormat()
		announcements.push(
			lastRewardValue === '0'
				? null
				: {
						value: `${lastRewardValue} ${unit}`,
						label: t('lastEraPayout'),
						category: t('participation'),
					},
		)
	} else {
		announcements.push(null)
	}

	announcements.sort(sortWithNull(true))

	// Group announcements by category
	const grouped: Record<string, Array<AnnouncementItem | null>> = {}
	for (const announcement of announcements) {
		if (announcement !== null) {
			const cat = announcement.category || ''
			if (!grouped[cat]) {
				grouped[cat] = []
			}
			grouped[cat].push(announcement)
		} else {
			const firstKey = Object.keys(grouped)[0] || ''
			if (!grouped[firstKey]) {
				grouped[firstKey] = []
			}
			grouped[firstKey].push(null)
		}
	}

	return <AnnouncementsList grouped={grouped} />
}
