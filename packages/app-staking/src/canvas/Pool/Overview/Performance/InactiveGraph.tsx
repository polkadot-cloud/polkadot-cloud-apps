// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import { useTranslation } from 'react-i18next'
import { PayoutLine } from 'ui-graphs'

export const InactiveGraph = ({
	width,
	height,
}: {
	width: string | number
	height: string | number
}) => {
	const { i18n, t } = useTranslation()
	const { network } = useNetwork()
	const { getThemeValue } = useThemeValues()
	const { unit } = getStakingChainData(network)
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	return (
		<PayoutLine
			syncing={false}
			entries={[]}
			width={width}
			height={height}
			getThemeValue={getThemeValue}
			unit={unit}
			dateFormat={dateFormat}
			labels={{
				era: t('era', { ns: 'app' }),
				reward: t('reward', { ns: 'modals' }),
				payouts: t('payouts', { ns: 'app' }),
			}}
		/>
	)
}
