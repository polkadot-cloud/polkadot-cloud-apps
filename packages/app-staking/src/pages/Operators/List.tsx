// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNetwork } from 'hooks/useNetwork'
import { StakingApiOperatorList } from 'library/StakingApiOperatorList'
import { Stats } from 'library/Stats'
import { type StatConfig, StatType } from 'library/Stats/types'
import { useOperatorStats } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Stat } from 'ui-app/Stat'
import { Page } from 'ui-core/base'

export const List = () => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const { data, loading } = useOperatorStats({ network })
	const { activeOperators, operatorValidatorCoverage, totalOperators } =
		data.operatorStats
	const activePercentage = totalOperators
		? (activeOperators / totalOperators) * 100
		: 0
	const coverage = Number.isFinite(operatorValidatorCoverage)
		? Math.min(100, Math.max(0, operatorValidatorCoverage))
		: 0
	const formatPercentage = (value: number) =>
		`${value.toLocaleString(i18n.resolvedLanguage, {
			maximumFractionDigits: 2,
		})}%`

	const stats: StatConfig[] = [
		{
			id: 'totalOperators',
			type: StatType.NUMBER,
			label: t('totalOperators'),
			value: totalOperators,
			unit: '',
			isPreloading: loading,
		},
		{
			id: 'activeOperators',
			type: StatType.PIE,
			label: t('activeOperators'),
			value: activeOperators,
			total: totalOperators,
			unit: '',
			pieValue: activePercentage,
			tooltip: formatPercentage(activePercentage),
			isPreloading: loading,
		},
		{
			id: 'operatorValidatorCoverage',
			type: StatType.PIE,
			label: t('operatorValidatorCoverage'),
			value: Number(coverage.toFixed(2)),
			unit: '%',
			pieValue: coverage,
			tooltip: formatPercentage(coverage),
			isPreloading: loading,
		},
	]

	return (
		<>
			<Stat.Row>
				<Stats items={stats} />
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					<StakingApiOperatorList />
				</CardWrapper>
			</Page.Row>
		</>
	)
}
