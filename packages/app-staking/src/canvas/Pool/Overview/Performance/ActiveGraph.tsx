// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useDateFormat } from 'hooks/useDateFormat'
import { useThemeValues } from 'hooks/useThemeValues'
import { useRewards } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import type { NetworkId } from 'types'
import { PayoutLine } from 'ui-graphs'

interface Props {
	network: NetworkId
	stash: string
	fromEra: number
	width: string | number
	height: string | number
	units: number
}
export const ActiveGraph = ({
	network,
	stash,
	fromEra,
	width,
	height,
	units,
}: Props) => {
	const { i18n, t } = useTranslation()
	const { getThemeValue } = useThemeValues()
	const { unit } = getStakingChainData(network)
	const dateFormat = useDateFormat(i18n.resolvedLanguage)
	const {
		data: { allRewards },
		loading,
		error,
	} = useRewards({
		network,
		who: stash,
		fromEra,
	})

	const list =
		loading || error
			? []
			: allRewards.map((reward) => ({
					era: reward.era,
					reward: planckToUnit(reward.reward, units),
					start: reward.timestamp,
				}))

	const sorted = [...list].sort((a, b) => a.era - b.era)

	return (
		<PayoutLine
			syncing={loading}
			entries={sorted}
			width={width}
			height={height}
			getThemeValue={getThemeValue}
			unit={unit}
			dateFormat={dateFormat}
			labels={{
				era: t('date', { ns: 'app' }),
				reward: t('reward', { ns: 'modals' }),
				payouts: t('payouts', { ns: 'app' }),
			}}
		/>
	)
}
