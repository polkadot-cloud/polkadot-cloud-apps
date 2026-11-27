// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { ellipsisFn } from '@polkadot-cloud/utils'
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
	GraphInner,
	Head,
	Main,
	StatCard,
	StatGrid,
	Subheading,
} from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'
import { ActiveGraph as ActiveGraphEraPoints } from './EraPoints/ActiveGraph'
import { InactiveGraph as InactiveGraphEraPoints } from './EraPoints/InactiveGraph'
import classes from './index.module.scss'
import { ActiveGraph as ActiveGraphRewards } from './Rewards/ActiveGraph'
import { InactiveGraph as InactiveGraphRewards } from './Rewards/InactiveGraph'
import { ValidatorDiscovery } from './ValidatorDiscovery'

const GRAPH_HEIGHT = 250

export const ValidatorMetrics = () => {
	const { t } = useTranslation()
	const {
		config: { options },
	} = useOverlay().canvas
	const { activeEra } = useApi()
	const { currency } = useCurrency()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { themeElementRef } = useTheme()
	const { unit, units } = getStakingChainData(network)

	const Token = getChainIcons(network).token
	const validator = options!.validator
	const { data: overviews, loading: overviewsLoading } = useValidatorOverviews([
		validator,
	])
	const { data: validatorOwnStake, loading: selfStakeLoading } =
		useValidatorSelfStake(validator)
	const { data: totalBacking, loading: totalBackingLoading } =
		useValidatorTotalBacking(validator)
	const identity = options!.identity
	const displayName = typeof identity === 'string' ? identity.trim() : identity
	const shortAddress = validator ? ellipsisFn(validator) : ''
	const title =
		displayName || shortAddress || t('validatorMetrics', { ns: 'modals' })
	const selfStakePlaceholder = selfStakeLoading
		? t('syncing', { ns: 'app' })
		: '—'
	const activeBackingPlaceholder = overviewsLoading
		? t('syncing', { ns: 'app' })
		: '—'

	const overview = overviews?.get(validator)
	const activeBacking = BigNumber.max(
		0,
		new BigNumber(overview?.total ?? 0n).minus(overview?.own ?? 0n),
	)

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
						<StatCard title={t('selfStake', { ns: 'modals' })}>
							{validatorOwnStake != null ? (
								<Balance.WithFiat
									compact
									Token={<Token role="img" aria-label={unit} />}
									value={planckToUnitBn(
										new BigNumber(validatorOwnStake),
										units,
									)}
									currency={currency}
								/>
							) : (
								<span>{selfStakePlaceholder}</span>
							)}
						</StatCard>
						<StatCard title={t('totalBacking', { ns: 'modals' })}>
							{totalBacking !== null ? (
								<Balance.WithFiat
									compact
									Token={<Token role="img" aria-label={unit} />}
									value={planckToUnitBn(new BigNumber(totalBacking), units)}
									currency={currency}
								/>
							) : (
								<span>
									{totalBackingLoading ? t('syncing', { ns: 'app' }) : '—'}
								</span>
							)}
						</StatCard>
						<StatCard title={t('activeBacking', { ns: 'modals' })}>
							{overviews ? (
								<Balance.WithFiat
									compact
									Token={<Token role="img" aria-label={unit} />}
									value={planckToUnitBn(activeBacking, units)}
									currency={currency}
								/>
							) : (
								<span>{activeBackingPlaceholder}</span>
							)}
						</StatCard>
					</StatGrid>
				</Subheading>
			</GraphContainer>
			<div className={classes.sections}>
				<section>
					<Subheading>
						<h3>{t('recentPerformance', { ns: 'app' })}</h3>
					</Subheading>
					<div className={classes.graphPanel}>
						<GraphInner width="100%" height={GRAPH_HEIGHT} noSpacing>
							{pluginEnabled('staking_api') ? (
								<ActiveGraphEraPoints
									network={network}
									validator={validator}
									fromEra={Math.max(activeEra.index - 1, 0)}
									width="100%"
									height={GRAPH_HEIGHT}
								/>
							) : (
								<>
									<StatusLabel
										status="active_service"
										statusFor="staking_api"
										title={t('stakingApiDisabled', { ns: 'pages' })}
										topOffset="37%"
									/>
									<InactiveGraphEraPoints width="100%" height={GRAPH_HEIGHT} />
								</>
							)}
						</GraphInner>
					</div>
				</section>
				<section>
					<Subheading>
						<h3>{t('rewardHistory', { ns: 'app' })}</h3>
					</Subheading>
					<div className={classes.graphPanel}>
						<GraphInner width="100%" height={GRAPH_HEIGHT} noSpacing>
							{pluginEnabled('staking_api') ? (
								<ActiveGraphRewards
									network={network}
									validator={validator}
									fromEra={Math.max(activeEra.index - 1, 0)}
									width="100%"
									height={GRAPH_HEIGHT}
								/>
							) : (
								<>
									<StatusLabel
										status="active_service"
										statusFor="staking_api"
										title={t('stakingApiDisabled', { ns: 'pages' })}
										topOffset="37%"
									/>
									<InactiveGraphRewards width="100%" height={GRAPH_HEIGHT} />
								</>
							)}
						</GraphInner>
					</div>
				</section>
				{pluginEnabled('staking_api') && (
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
