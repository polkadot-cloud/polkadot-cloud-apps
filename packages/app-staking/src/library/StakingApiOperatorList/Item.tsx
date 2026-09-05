// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { ListFormat } from 'contexts/List/types'
import { useNetwork } from 'hooks/useNetwork'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { Identity } from 'library/ListItem/Labels/Identity'
import type { OperatorListItem } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DetailedCard, ListItem } from 'ui-app/ListItem'
import {
	clampRate,
	formatCompactNumber,
	getRateColor,
	planckToUnitBn,
} from 'utils'
import { RowActionsMenu } from './RowActionsMenu'
import { CardSummary } from './styles'
import { ValidatorsButton } from './ValidatorsButton'

interface ItemProps {
	format: ListFormat
	operator: OperatorListItem
}

const StakeValue = ({ unit, value }: { unit: string; value?: BigNumber }) => {
	const { i18n } = useTranslation()

	return value === undefined ? (
		'—'
	) : (
		<>
			<span>
				{formatCompactNumber(value.toNumber(), i18n.resolvedLanguage)}
			</span>
			<small>{unit}</small>
		</>
	)
}

export const Item = ({ format, operator }: ItemProps) => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const { activeValidatorCount, identity, validatorCount } = operator
	const active = activeValidatorCount > 0
	const activeValidatorRatio = `${activeValidatorCount.toLocaleString(i18n.resolvedLanguage)}/${validatorCount.toLocaleString(i18n.resolvedLanguage)}`
	const activityValue = active
		? `${activeValidatorRatio} ${t('active')}`
		: t('inactive')
	const combinedSelfStake = planckToUnitBn(
		new BigNumber(operator.combinedSelfStake),
		units,
	)
	const averageSelfStake =
		validatorCount > 0 ? combinedSelfStake.dividedBy(validatorCount) : undefined
	const suppliedRetainmentRate = operator.retainment.oneMonth?.retainmentRate
	const retainmentRate =
		typeof suppliedRetainmentRate === 'number' &&
		Number.isFinite(suppliedRetainmentRate)
			? clampRate(suppliedRetainmentRate)
			: undefined
	const retainmentRateLabel =
		retainmentRate === undefined
			? '—'
			: `${retainmentRate.toLocaleString(i18n.resolvedLanguage, {
					maximumFractionDigits: 1,
				})}%`
	const retainmentMonthDate = operator.retainment.oneMonth
		? new Date(operator.retainment.oneMonth.fromTimestamp * 1000)
		: undefined
	const retainmentMonth = retainmentMonthDate
		? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
				month: 'long',
				year: 'numeric',
				timeZone: 'UTC',
			}).format(retainmentMonthDate)
		: undefined
	const identityNode = (
		<Identity address={identity.address} display={identity.display || null} />
	)
	const cardActions = (
		<ListItem.Actions>
			<ListItem.Action>
				<CopyAddress address={identity.address} />
			</ListItem.Action>
			<ListItem.Action wide>
				<ValidatorsButton operator={operator} />
			</ListItem.Action>
		</ListItem.Actions>
	)
	const metrics: Array<{
		color?: string
		key: string
		label: ReactNode
		title?: string
		value: ReactNode
	}> = [
		{
			key: 'validatorCount',
			label: t('validatorCount'),
			value: validatorCount.toLocaleString(i18n.resolvedLanguage),
		},
		{
			color: active ? undefined : 'var(--text-tertiary)',
			key: 'activity',
			label: (
				<>
					<ListItem.StatusDot active={active} aria-hidden="true" />
					<span>{t(active ? 'active' : 'waiting')}</span>
				</>
			),
			value: <span>{activityValue}</span>,
		},
		{
			key: 'combinedSelfStake',
			label: t('combinedSelfStake'),
			title: `${combinedSelfStake.toFormat()} ${unit}`,
			value: <StakeValue unit={unit} value={combinedSelfStake} />,
		},
		{
			key: 'averageSelfStake',
			label: t('averageSelfStake'),
			title: averageSelfStake
				? `${averageSelfStake.toFormat()} ${unit}`
				: undefined,
			value: <StakeValue unit={unit} value={averageSelfStake} />,
		},
		{
			key: 'retainmentRate',
			color:
				retainmentRate === undefined
					? 'var(--text-tertiary)'
					: getRateColor(retainmentRate),
			label: (
				<>
					{t('retainmentRate')}
					{format === 'col' && retainmentMonthDate && retainmentMonth ? (
						<ListItem.Month dateTime={retainmentMonthDate.toISOString()}>
							/ {retainmentMonth}
						</ListItem.Month>
					) : null}
				</>
			),
			value: retainmentRateLabel,
		},
	]
	const metricNodes = metrics.map(({ color, key, label, title, value }) => (
		<ListItem.Metric
			key={key}
			color={color}
			label={label}
			valueProps={{ title }}
		>
			{value}
		</ListItem.Metric>
	))

	if (format === 'row') {
		return (
			<ListItem.Row displayFor="default">
				<ListItem.RowIdentity>
					<ListItem.Identity>{identityNode}</ListItem.Identity>
				</ListItem.RowIdentity>
				<ListItem.RowMetrics
					style={{
						gridTemplateColumns: 'repeat(5, minmax(7rem, 1fr))',
					}}
				>
					{metricNodes}
				</ListItem.RowMetrics>
				<RowActionsMenu operator={operator} />
			</ListItem.Row>
		)
	}

	return (
		<DetailedCard.Root displayFor="default">
			<DetailedCard.Top>
				<DetailedCard.Header>
					<ListItem.Identity>{identityNode}</ListItem.Identity>
					{cardActions}
				</DetailedCard.Header>
				<CardSummary aria-label={t('operatorSummary')}>
					{metricNodes}
				</CardSummary>
			</DetailedCard.Top>
		</DetailedCard.Root>
	)
}
