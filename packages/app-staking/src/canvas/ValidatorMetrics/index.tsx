// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { ellipsisFn, maxBigInt } from '@polkadot-cloud/utils'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import {
	useValidatorOverviews,
	useValidatorSelfStake,
	useValidatorTotalBacking,
} from 'data-gate'
import { useApi } from 'hooks/useApi'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useTheme } from 'hooks/useTheme'
import { Balance } from 'library/Balance'
import { CopyAddress } from 'library/ListItem/Buttons/CopyAddress'
import { StatusLabel } from 'library/StatusLabel'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'ui-core/base'
import {
	AccountTitle,
	GraphContainer,
	Head,
	Main,
	StatCard,
	StatGrid,
	Subheading,
} from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'
import { BackingHistory } from './BackingHistory'
import { ChartSection, graphSize } from './ChartSection'
import { ActiveGraph as ActiveGraphEraPoints } from './EraPoints/ActiveGraph'
import { InactiveGraph as InactiveGraphEraPoints } from './EraPoints/InactiveGraph'
import classes from './index.module.scss'
import { ActiveGraph as ActiveGraphRewards } from './Rewards/ActiveGraph'
import { InactiveGraph as InactiveGraphRewards } from './Rewards/InactiveGraph'
import { ValidatorDiscovery } from './ValidatorDiscovery'

const charts = [
	{
		title: 'recentPerformance',
		ActiveGraph: ActiveGraphEraPoints,
		InactiveGraph: InactiveGraphEraPoints,
	},
	{
		title: 'rewardHistory',
		ActiveGraph: ActiveGraphRewards,
		InactiveGraph: InactiveGraphRewards,
	},
] as const

export const ValidatorMetrics = () => {
	const { t } = useTranslation()
	const {
		config: { options },
	} = useOverlay().canvas
	const { activeEra } = useApi()
	const lastCompletedEra = activeEra.index - 1
	const { currency } = useCurrency()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { themeElementRef } = useTheme()
	const { unit, units } = getStakingChainData(network)

	const Token = getChainIcons(network).token
	const { validator, identity } = options!
	const { data: overviews, loading: overviewsLoading } = useValidatorOverviews([
		validator,
	])
	const selfStake = useValidatorSelfStake(validator)
	const totalBacking = useValidatorTotalBacking(validator)
	const stakingApiEnabled = pluginEnabled('staking_api')
	const displayName = typeof identity === 'string' ? identity.trim() : identity
	const shortAddress = validator ? ellipsisFn(validator) : ''
	const title =
		displayName || shortAddress || t('validatorMetrics', { ns: 'modals' })

	const overview = overviews?.get(validator)
	const stats = [
		{ title: 'selfStake', ...selfStake },
		{ title: 'totalBacking', ...totalBacking },
		{
			title: 'activeBacking',
			data:
				overviews &&
				maxBigInt((overview?.total ?? 0n) - (overview?.own ?? 0n), 0n),
			loading: overviewsLoading,
		},
	] as const

	return (
		<Main style={{ paddingTop: 0 }}>
			<header className={classes.header}>
				<Head>
					<CloseCanvas />
				</Head>
				<AccountTitle
					style={{
						margin: '0',
						paddingBottom: '1.25rem',
						// The card clips the divider at its edges.
						borderImage:
							'linear-gradient(var(--gray-500), var(--gray-500)) 1 / 1 / 0 100vw',
					}}
				>
					<div>
						<div>
							<Polkicon
								address={validator}
								background="transparent"
								fontSize="4rem"
							/>
						</div>
						<div className={classes.identity}>
							<h1>{title}</h1>
							{validator && (
								<h2 className={classes.address}>
									<Tooltip
										align="start"
										container={themeElementRef.current || undefined}
										side="top"
										text={validator}
									>
										{/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need access to the full address tooltip. */}
										<span tabIndex={0}>{shortAddress}</span>
									</Tooltip>
									<CopyAddress address={validator} />
								</h2>
							)}
						</div>
					</div>
				</AccountTitle>
			</header>
			<GraphContainer>
				<Subheading>
					<h3>{t('backingOverview', { ns: 'app' })}</h3>
					<StatGrid style={{ marginTop: '1rem' }}>
						{stats.map(({ title, data, loading }) => (
							<StatCard key={title} title={t(title, { ns: 'modals' })}>
								{data == null ? (
									<span>{loading ? t('syncing', { ns: 'app' }) : '—'}</span>
								) : (
									<Balance.WithFiat
										compact
										Token={<Token role="img" aria-label={unit} />}
										value={planckToUnitBn(new BigNumber(data), units)}
										currency={currency}
									/>
								)}
							</StatCard>
						))}
					</StatGrid>
				</Subheading>
			</GraphContainer>
			<div className={classes.sections}>
				{charts.map(({ title, ActiveGraph, InactiveGraph }) => (
					<ChartSection key={title} title={t(title, { ns: 'app' })}>
						{stakingApiEnabled ? (
							<ActiveGraph
								network={network}
								validator={validator}
								fromEra={Math.max(lastCompletedEra, 0)}
								{...graphSize}
							/>
						) : (
							<>
								<StatusLabel
									status="active_service"
									statusFor="staking_api"
									title={t('stakingApiDisabled', { ns: 'pages' })}
									topOffset="37%"
								/>
								<InactiveGraph {...graphSize} />
							</>
						)}
					</ChartSection>
				))}
				{stakingApiEnabled && network === 'polkadot' && (
					<BackingHistory
						network={network}
						validator={validator}
						toEra={lastCompletedEra}
						totalBacking={totalBacking}
					/>
				)}
				{stakingApiEnabled && (
					<section>
						<Subheading>
							<h3>{t('operatorDetails', { ns: 'app' })}</h3>
						</Subheading>
						<ValidatorDiscovery network={network} address={validator} />
					</section>
				)}
			</div>
		</Main>
	)
}
