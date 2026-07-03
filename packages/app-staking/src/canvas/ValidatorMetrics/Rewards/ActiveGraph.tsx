// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { useDateFormat } from 'hooks/useDateFormat'
import { useValidatorRewards } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import type { NetworkId } from 'types'
import { PayoutLine } from 'ui-graphs'

interface Props {
	network: NetworkId
	validator: string
	fromEra: number
	width: string | number
	height: string | number
}
export const ActiveGraph = ({
	network,
	validator,
	fromEra,
	width,
	height,
}: Props) => {
	const { i18n, t } = useTranslation()
	const { getThemeValue } = useThemeValues()
	const { data, loading, error } = useValidatorRewards({
		network,
		validator,
		fromEra,
	})
	const { units, unit } = getStakingChainData(network)
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	const list =
		loading || error
			? []
			: data.validatorRewards.map((reward) => ({
					era: reward.era,
					reward: planckToUnit(reward.reward, units),
					start: reward.start,
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
