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
	const { identity, validatorCount } = operator
	const combinedSelfStake = planckToUnitBn(
		new BigNumber(operator.combinedSelfStake),
		units,
	)
	const averageSelfStake =
		validatorCount > 0 ? combinedSelfStake.dividedBy(validatorCount) : undefined
	const suppliedRetainmentRate = operator.retainment?.retainmentRate
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
	const identityNode = (
		<Identity address={identity.address} display={identity.display || null} />
	)
	const actions = (
		<ListItem.Actions>
			<ListItem.Action>
				<CopyAddress address={identity.address} />
			</ListItem.Action>
		</ListItem.Actions>
	)
	const metrics: Array<{
		color?: string
		label: string
		title?: string
		value: ReactNode
	}> = [
		{
			label: t('validators'),
			value: validatorCount.toLocaleString(i18n.resolvedLanguage),
		},
		{
			label: t('combinedSelfStake'),
			title: `${combinedSelfStake.toFormat()} ${unit}`,
			value: <StakeValue unit={unit} value={combinedSelfStake} />,
		},
		{
			color:
				retainmentRate === undefined ? undefined : getRateColor(retainmentRate),
			label: t('retainmentRate'),
			value: retainmentRateLabel,
		},
		{
			label: t('averageSelfStake'),
			title: averageSelfStake
				? `${averageSelfStake.toFormat()} ${unit}`
				: undefined,
			value: <StakeValue unit={unit} value={averageSelfStake} />,
		},
	]
	const metricNodes = metrics.map(({ color, label, title, value }) => (
		<ListItem.Metric
			key={label}
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
						gridTemplateColumns: 'repeat(4, minmax(7rem, 1fr))',
					}}
				>
					{metricNodes}
				</ListItem.RowMetrics>
				{actions}
			</ListItem.Row>
		)
	}

	return (
		<DetailedCard.Root displayFor="default">
			<DetailedCard.Top>
				<DetailedCard.Header>
					<ListItem.Identity>{identityNode}</ListItem.Identity>
					{actions}
				</DetailedCard.Header>
				<ListItem.Summary aria-label={t('operatorSummary')}>
					{metricNodes}
				</ListItem.Summary>
			</DetailedCard.Top>
		</DetailedCard.Root>
	)
}
