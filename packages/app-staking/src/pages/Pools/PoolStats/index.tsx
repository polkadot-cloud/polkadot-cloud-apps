// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { PerbillMultiplier } from 'consts'
import { getStakingChainData } from 'consts/util'
import { useActivePool } from 'hooks/useActivePool'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { usePoolCommission } from 'hooks/usePoolCommission'
import type { AnnouncementItem } from 'library/Announcements/types'
import { CardWrapper } from 'library/Card/Wrappers'
import { Wrapper } from 'library/List'
import { useTranslation } from 'react-i18next'
import { CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'
import { Announcements } from './Announcements'

export const PoolStats = () => {
	const { t } = useTranslation('pages')
	const { openCanvas } = useOverlay().canvas
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { activePool } = useActivePool()
	const { getCurrentCommission } = usePoolCommission()

	const { unit, units } = getStakingChainData(network)
	const poolId = activePool?.id || 0

	const { state, points, memberCounter } = activePool?.bondedPool || {}
	const currentCommission = getCurrentCommission(poolId)

	const bonded = planckToUnitBn(new BigNumber(points || 0), units)
		.decimalPlaces(3)
		.toFormat()

	let stateDisplay
	switch (state) {
		case 'Blocked':
			stateDisplay = t('locked')
			break
		case 'Destroying':
			stateDisplay = t('destroying')
			break
		default:
			stateDisplay = t('open')
			break
	}

	const items: AnnouncementItem[] = [
		{
			label: t('poolState'),
			value: stateDisplay,
		},
	]

	if (currentCommission) {
		items.push({
			label: t('poolCommission'),
			value: `${currentCommission / PerbillMultiplier}%`,
		})
	}

	items.push(
		{
			label: t('poolMembers'),
			value: `${memberCounter}`,
			button: pluginEnabled('staking_api')
				? {
						text: t('browseMembers'),
						onClick: () => {
							openCanvas({
								key: 'PoolMembers',
								options: {
									poolId,
								},
								size: 'xl',
							})
						},
						disabled: [0, undefined].includes(memberCounter),
					}
				: undefined,
		},
		{
			label: t('totalBonded'),
			value: `${bonded} ${unit}`,
		},
	)

	return (
		<CardWrapper>
			<CardHeader margin>
				<h3>{t('poolStats')}</h3>
			</CardHeader>
			<Wrapper>
				<Announcements items={items} />
			</Wrapper>
		</CardWrapper>
	)
}
