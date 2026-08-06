// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faArrowRight,
	faArrowTrendDown,
	faArrowTrendUp,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { HistoricalEraPoints } from 'library/List/EraPointsGraph/HistoricalEraPoints'
import type {
	ValidatorEraPoints,
	ValidatorRetainmentPeriod,
} from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'
import { planckToUnitBn } from 'utils'
import { Select } from '../ListItem/Buttons/Select'
import { Identity } from '../ListItem/Labels/Identity'
import { clampRate, getRateColor, MAX_SELF_STAKE_DOT } from './retainment'
import { useValidatorSummaryData } from './ValidatorSummary'
import {
	BarIdentity,
	BarLayout,
	BarPerformanceGraph,
	BarStat,
	BarStatLabel,
	BarStats,
	BarStatValue,
	BarWrapper,
	BlockedBadge,
	HeaderIdentity,
	SummaryStatusDot,
} from './Wrappers'

interface ValidatorBarProps {
	actions: ReactNode
	displayFor: DisplayFor
	eraPoints: ValidatorEraPoints[]
	innerClasses: string
	rate?: number
	selfStake?: BigNumber
	unit: string
	units: number
	validator: ValidatorListEntry
	retainment?: ValidatorRetainmentPeriod
}

export const ValidatorBar = ({
	actions,
	displayFor,
	eraPoints,
	innerClasses,
	rate,
	selfStake,
	unit,
	units,
	validator,
	retainment,
}: ValidatorBarProps) => {
	const { t, i18n } = useTranslation('app')
	const { selectable } = useList()
	const { address, prefs, validatorStatus: status } = validator
	const {
		quartileLabel,
		rateLabel,
		selfStakeLabel,
		statusLabel,
		totalStake,
		validatorStatus,
	} = useValidatorSummaryData({ address, rate, selfStake, status, unit })
	const compoundMax =
		retainment !== undefined &&
		unit === 'DOT' &&
		selfStake?.gte(MAX_SELF_STAKE_DOT) === true
	const retainmentRate =
		typeof retainment?.retainmentRate === 'number' &&
		Number.isFinite(retainment.retainmentRate)
			? clampRate(retainment.retainmentRate)
			: undefined
	const compoundRate = compoundMax
		? 100
		: typeof retainment?.compoundRate === 'number' &&
				Number.isFinite(retainment.compoundRate)
			? clampRate(retainment.compoundRate)
			: undefined
	const retainmentValue =
		retainmentRate === undefined
			? '—'
			: `${retainmentRate.toLocaleString(i18n.resolvedLanguage, {
					maximumFractionDigits: 1,
				})}%`
	const compoundValue = compoundMax
		? 'MAX'
		: compoundRate === undefined
			? '—'
			: `${compoundRate.toLocaleString(i18n.resolvedLanguage, {
					maximumFractionDigits: 1,
				})}%`
	const netInflow = retainment
		? planckToUnitBn(new BigNumber(retainment.netInflow), units).toNumber()
		: undefined
	const flowValue =
		netInflow === undefined
			? '—'
			: Math.abs(netInflow).toLocaleString(i18n.resolvedLanguage, {
					notation: 'compact',
					maximumFractionDigits: 1,
				})
	const flowLabel =
		netInflow === undefined || netInflow > 0
			? t('netInflow')
			: netInflow < 0
				? t('netOutflow')
				: t('noNetFlow')
	const flowColor =
		netInflow === undefined || netInflow === 0
			? 'var(--text-tertiary)'
			: netInflow > 0
				? 'var(--status-success)'
				: 'var(--status-danger)'
	const flowIcon =
		netInflow === undefined
			? undefined
			: netInflow > 0
				? faArrowTrendUp
				: netInflow < 0
					? faArrowTrendDown
					: faArrowRight
	const flowPrefix =
		netInflow === undefined || netInflow === 0 ? '' : netInflow > 0 ? '+' : '−'

	return (
		<BarWrapper>
			<div className={innerClasses}>
				<BarLayout>
					<BarIdentity>
						{selectable && <Select item={validator} />}
						<HeaderIdentity>
							<Identity address={address} />
							{prefs?.blocked === true && (
								<BlockedBadge>{t('blocked')}</BlockedBadge>
							)}
						</HeaderIdentity>
						<BarPerformanceGraph
							aria-label={t('performance')}
							title={t('performance')}
						>
							<HistoricalEraPoints
								address={address}
								displayFor={displayFor}
								eraPoints={eraPoints}
								stretch
							/>
						</BarPerformanceGraph>
					</BarIdentity>

					<BarStats>
						<BarStat>
							<BarStatLabel>
								<SummaryStatusDot
									$active={validatorStatus === 'active'}
									aria-hidden="true"
								/>
								<span>{statusLabel}</span>
							</BarStatLabel>
							<BarStatValue
								title={totalStake ? `${totalStake} ${unit}` : undefined}
							>
								<span>{totalStake ?? '—'}</span>
								{totalStake && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>APY</BarStatLabel>
							<BarStatValue>{rateLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>{t('performance')}</BarStatLabel>
							<BarStatValue>{quartileLabel}</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>
								{t('selfStake', { defaultValue: 'Self stake' })}
							</BarStatLabel>
							<BarStatValue>
								<span>{selfStakeLabel}</span>
								{selfStake !== undefined && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>
								{t('retainmentRate', {
									defaultValue: 'Retainment',
								})}
							</BarStatLabel>
							<BarStatValue
								$color={
									retainmentRate === undefined
										? 'var(--text-tertiary)'
										: getRateColor(retainmentRate)
								}
								role={retainmentRate === undefined ? undefined : 'meter'}
								aria-valuemin={retainmentRate === undefined ? undefined : 0}
								aria-valuemax={retainmentRate === undefined ? undefined : 100}
								aria-valuenow={retainmentRate}
							>
								{retainmentValue}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>
								{t('compoundRate', { defaultValue: 'Compound' })}
							</BarStatLabel>
							<BarStatValue
								$color={
									compoundRate === undefined
										? 'var(--text-tertiary)'
										: getRateColor(compoundRate)
								}
								role={compoundRate === undefined ? undefined : 'meter'}
								aria-valuemin={compoundRate === undefined ? undefined : 0}
								aria-valuemax={compoundRate === undefined ? undefined : 100}
								aria-valuenow={compoundRate}
								aria-valuetext={compoundMax ? 'Maximum' : compoundValue}
							>
								{compoundValue}
							</BarStatValue>
						</BarStat>
						<BarStat>
							<BarStatLabel>{flowLabel}</BarStatLabel>
							<BarStatValue $color={flowColor}>
								{flowIcon && (
									<FontAwesomeIcon icon={flowIcon} aria-hidden="true" />
								)}
								<span>
									{flowPrefix}
									{flowValue}
								</span>
								{netInflow !== undefined && <small>{unit}</small>}
							</BarStatValue>
						</BarStat>
					</BarStats>

					{actions}
				</BarLayout>
			</div>
		</BarWrapper>
	)
}
