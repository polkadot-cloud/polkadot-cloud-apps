// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSize } from '@w3ux/hooks'
import { Polkicon } from '@w3ux/react-polkicon'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useValidatorOverviews } from 'data-gate'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useUi } from 'hooks/useUi'
import { StatusLabel } from 'library/StatusLabel'
import { useRef } from 'react'
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
import { formatSize, planckToUnitBn } from 'utils'
import { ActiveGraph as ActiveGraphEraPoints } from './EraPoints/ActiveGraph'
import { InactiveGraph as InactiveGraphEraPoints } from './EraPoints/InactiveGraph'
import { ActiveGraph as ActiveGraphRewards } from './Rewards/ActiveGraph'
import { InactiveGraph as InactiveGraphRewards } from './Rewards/InactiveGraph'
import { ValidatorDiscovery } from './ValidatorDiscovery'

export const ValidatorMetrics = () => {
	const { t } = useTranslation()
	const {
		config: { options },
	} = useOverlay().canvas
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { containerRefs } = useUi()
	const { pluginEnabled } = usePlugins()
	const { unit, units } = getStakingChainData(network)

	const Token = getChainIcons(network).token
	const validator = options!.validator
	const { data: overviews } = useValidatorOverviews([validator])
	const identity = options!.identity

	const overview = overviews?.get(validator)
	const validatorOwnStake = new BigNumber(overview?.own ?? 0n)
	const otherStake = BigNumber.max(
		0,
		new BigNumber(overview?.total ?? 0n).minus(validatorOwnStake),
	)

	const GRAPH_HEIGHT = 250

	// Era points graph ref & sizing
	const graphEraPointsRef = useRef<HTMLDivElement | null>(null)
	const sizeEraPoints = useSize(graphEraPointsRef, {
		outerElement: containerRefs?.mainInterface,
	})
	const graphSizeEraPoints = formatSize(sizeEraPoints, GRAPH_HEIGHT)

	// token earned graph ref & sizing
	const graphRewardsRef = useRef<HTMLDivElement | null>(null)
	const sizeRewards = useSize(graphRewardsRef, {
		outerElement: containerRefs?.mainInterface,
	})
	const graphSizeRewards = formatSize(sizeRewards, GRAPH_HEIGHT)

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
							{planckToUnitBn(validatorOwnStake, units).toFormat()} {unit}
						</Stat>
						<Stat withIcon>
							<Token />
							{t('nominatorStake', { ns: 'modals' })}:{' '}
							{planckToUnitBn(otherStake, units).decimalPlaces(0).toFormat()}{' '}
							{unit}
						</Stat>
					</h4>
				</Subheading>
			</GraphContainer>
			<div style={{ margin: '1.5rem 0 3rem 0' }}>
				<Subheading>
					<h3>{t('recentPerformance', { ns: 'app' })}</h3>
				</Subheading>
				<GraphInner
					ref={graphEraPointsRef}
					width={graphSizeEraPoints.width}
					height={graphSizeEraPoints.height}
				>
					{pluginEnabled('staking_api') ? (
						<ActiveGraphEraPoints
							network={network}
							validator={validator}
							fromEra={Math.max(activeEra.index - 1, 0)}
							width={graphSizeEraPoints.width}
							height={graphSizeEraPoints.height}
						/>
					) : (
						<>
							<StatusLabel
								status="active_service"
								statusFor="staking_api"
								title={t('stakingApiDisabled', { ns: 'pages' })}
								topOffset="37%"
							/>
							<InactiveGraphEraPoints
								width={graphSizeEraPoints.width}
								height={graphSizeEraPoints.height}
							/>
						</>
					)}
				</GraphInner>
				<Subheading>
					<h3>{t('rewardHistory', { ns: 'app' })}</h3>
				</Subheading>
				<GraphInner
					ref={graphRewardsRef}
					width={graphSizeRewards.width}
					height={graphSizeRewards.height}
				>
					{pluginEnabled('staking_api') ? (
						<ActiveGraphRewards
							network={network}
							validator={validator}
							fromEra={Math.max(activeEra.index - 1, 0)}
							width={graphSizeRewards.width}
							height={graphSizeRewards.height}
						/>
					) : (
						<>
							<StatusLabel
								status="active_service"
								statusFor="staking_api"
								title={t('stakingApiDisabled', { ns: 'pages' })}
								topOffset="37%"
							/>
							<InactiveGraphRewards
								width={graphSizeRewards.width}
								height={graphSizeRewards.height}
							/>
						</>
					)}
				</GraphInner>
				{pluginEnabled('staking_api') && (
					<>
						<Subheading style={{ marginTop: '1rem' }}>
							<h3>{t('operatorDetails', { ns: 'app' })}</h3>
						</Subheading>
						<ValidatorDiscovery network={network} address={validator} />
					</>
				)}
			</div>
		</Main>
	)
}
