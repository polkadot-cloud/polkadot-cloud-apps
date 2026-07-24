// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { Number } from 'library/StatCards/Number'
import { useTranslation } from 'react-i18next'
import type { AnalyzedPayoutsProps } from '../types'

// We simply report the size of payouts that have been analyzed for decentralization purpose

export const AnalyzedPayouts = ({ data }: AnalyzedPayoutsProps) => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { unit } = getStakingChainData(network)

	const params = {
		label: t('totalPayoutsAnalysed'),
		value:
			data?.nodeDistributionDetail?.reduce(
				(acc, node) => acc + node.TokenRewards,
				0,
			) || 0,
		decimals: 1,
		unit,
		helpKey: 'Total Payouts Analysed',
	}
	return <Number {...params} />
}
