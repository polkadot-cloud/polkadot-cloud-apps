// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useValidatorOverviews, useValidatorSelfStake } from 'data-gate'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { StatusLabel } from 'library/StatusLabel'
import { useTranslation } from 'react-i18next'
import {
	AccountTitle,
	GraphContainer,
	GraphInner,
	Head,
	Main,
	Stat,
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
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { unit, units } = getStakingChainData(network)

	const Token = getChainIcons(network).token
	const validator = options!.validator
	const { data: overviews, loading: overviewsLoading } = useValidatorOverviews([
		validator,
	])
	const { data: validatorOwnStake, loading: selfStakeLoading } =
		useValidatorSelfStake(validator)
	const identity = options!.identity
	const selfStakePlaceholder = selfStakeLoading
		? t('syncing', { ns: 'app' })
		: '—'
	const nominatorStakePlaceholder = overviewsLoading
		? t('syncing', { ns: 'app' })
		: '—'

	const overview = overviews?.get(validator)
	const otherStake = BigNumber.max(
		0,
		new BigNumber(overview?.total ?? 0n).minus(overview?.own ?? 0n),
	)

	return (
		<Main>
			<Head>
				<CloseCanvas />
			</Head>
			<AccountTitle>
				<div>
					<div>
						<Polkicon
							address={validator}
							background="transparent"
							fontSize="4rem"
						/>
					</div>
					<div>
						<h1>{identity}</h1>
					</div>
				</div>
			</AccountTitle>
			<GraphContainer>
				<Subheading>
					<h4>
						<Stat withIcon>
							<Token />
							{t('selfStake', { ns: 'modals' })}:{' '}
							{validatorOwnStake != null
								? `${planckToUnitBn(new BigNumber(validatorOwnStake), units).toFormat()} ${unit}`
								: selfStakePlaceholder}
						</Stat>
						<Stat withIcon>
							<Token />
							{t('nominatorStake', { ns: 'modals' })}:{' '}
							{overviews
								? `${planckToUnitBn(otherStake, units).decimalPlaces(0).toFormat()} ${unit}`
								: nominatorStakePlaceholder}
						</Stat>
					</h4>
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
