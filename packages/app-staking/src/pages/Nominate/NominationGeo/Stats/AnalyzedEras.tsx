// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Number } from 'library/StatCards/Number'
import { useTranslation } from 'react-i18next'

import type { AnalyzedErasProps } from '../types'

// We currently analyse the number of eras in the last 30 days/month.

export const AnalyzedEras = ({ meta }: AnalyzedErasProps) => {
	const { t } = useTranslation('pages')

	const params = {
		label: t('maxErasAnalyzed'),
		value: meta?.ErasPerMonth || 0,
		unit: 'Eras',
		helpKey: 'Decentralization Analytics Period',
	}
	return <Number {...params} />
}
