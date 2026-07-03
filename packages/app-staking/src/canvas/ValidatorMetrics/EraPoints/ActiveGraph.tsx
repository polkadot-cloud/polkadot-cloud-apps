// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useThemeValues } from 'contexts/ThemeValues'
import { useDateFormat } from 'hooks/useDateFormat'
import { useValidatorEraPoints } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import type { NetworkId } from 'types'
import { EraPointsLine } from 'ui-graphs'

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
	const dateFormat = useDateFormat(i18n.resolvedLanguage)
	const { data, loading, error } = useValidatorEraPoints({
		network,
		validator,
		fromEra,
	})

	const list = loading || error ? [] : data.validatorEraPoints
	const sorted = [...list].sort((a, b) => a.era - b.era)

	return (
		<EraPointsLine
			syncing={loading}
			entries={sorted}
			width={width}
			height={height}
			getThemeValue={getThemeValue}
			dateFormat={dateFormat}
			labels={{
				date: t('date', { ns: 'app' }),
				era: t('era', { ns: 'app' }),
				eraPoints: t('eraPoints', { ns: 'app' }),
			}}
		/>
	)
}
