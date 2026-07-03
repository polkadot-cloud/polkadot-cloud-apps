// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Number } from 'library/StatCards/Number'
import { useTranslation } from 'react-i18next'

// We simply report the number of days used to analyse the nomination, currently is fixed to 30

export const AnalyzedDays = () => {
	const { t } = useTranslation('pages')
	const params = {
		label: t('maxDaysAnalyzed'),
		value: 30,
		unit: 'Days',
		helpKey: 'Decentralization Analytics Period',
	}
	return <Number {...params} />
}
