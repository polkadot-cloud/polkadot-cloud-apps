// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDateFormat } from 'hooks/useDateFormat'
import { useThemeValues } from 'hooks/useThemeValues'
import { useTranslation } from 'react-i18next'
import { EraPointsLine } from 'ui-graphs'

export const InactiveGraph = ({
	width,
	height,
}: {
	width: string | number
	height: string | number
}) => {
	const { i18n, t } = useTranslation()
	const { getThemeValue } = useThemeValues()
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	return (
		<EraPointsLine
			syncing={false}
			entries={[]}
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
