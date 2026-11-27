// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils'
import { getStakingChainData } from 'consts/util'
import { useThemeValues } from 'hooks/useThemeValues'
import { AnnouncementsList } from 'library/Announcements/AnnouncementsList'
import { useValidatorBackingHistory } from 'plugin-staking-api'
import { useTranslation } from 'react-i18next'
import type { NetworkId } from 'types'
import { Spinner } from 'ui-core/base'
import { ValidatorBackingLine } from 'ui-graphs'
import { ChartSection } from './ChartSection'

interface Props {
	network: NetworkId
	validator: string
	toEra: number
	totalBacking: { data: bigint | null; loading: boolean }
}

export const BackingHistory = ({ totalBacking, ...historyParams }: Props) => {
	const { t, i18n } = useTranslation()
	const { getThemeValue } = useThemeValues()
	const { units, unit } = getStakingChainData(historyParams.network)
	const { data, loading, error } = useValidatorBackingHistory(historyParams)
	const pending = loading || historyParams.toEra < 0
	const rows = pending || error ? [] : data.validatorBackingHistory
	const entries = rows.map(({ era, totalBacking, nominatorCount }) => ({
		era,
		backing:
			totalBacking === null ? null : Number(planckToUnit(totalBacking, units)),
		nominators: nominatorCount,
	}))
	const latest = entries.findLast(({ nominators }) => nominators !== null)
	const nominatorLabel = t('totalNominators', { ns: 'pages' })
	const backingLabel = t('totalBacking', { ns: 'modals' })
	const unavailable = t('notAvailable', { ns: 'app' })

	const nominatorStat = pending
		? null
		: {
				label: nominatorLabel,
				value:
					latest?.nominators?.toLocaleString(i18n.resolvedLanguage) ??
					unavailable,
			}
	const backingFormat = new Intl.NumberFormat(i18n.resolvedLanguage, {
		maximumFractionDigits: units,
	})
	const backingStat =
		totalBacking.data === null && totalBacking.loading
			? null
			: {
					label: backingLabel,
					value:
						totalBacking.data === null
							? unavailable
							: `${backingFormat.format(planckToUnit(totalBacking.data, units) as `${number}`)} ${unit}`,
				}
	const chart = pending ? (
		<Spinner />
	) : entries.some(({ backing }) => backing !== null) ? (
		<ValidatorBackingLine
			entries={entries}
			unit={unit}
			locale={i18n.resolvedLanguage}
			labels={{
				era: t('era', { ns: 'app' }),
				backing: backingLabel,
				nominators: nominatorLabel,
			}}
			colors={{
				backing: getThemeValue('--gray-800'),
				nominators: getThemeValue('--gray-1000'),
				text: getThemeValue('--gray-900'),
			}}
		/>
	) : (
		<p>{unavailable}</p>
	)
	return (
		<>
			<ChartSection title={t('backingHistory', { ns: 'app' })}>
				{chart}
			</ChartSection>
			<div style={{ overflowWrap: 'anywhere' }}>
				<AnnouncementsList items={[nominatorStat, backingStat]} />
			</div>
		</>
	)
}
