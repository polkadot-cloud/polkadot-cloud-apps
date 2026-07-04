// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { PolkawatchApi } from '@polkawatch/ddp-client'
import { PolkawatchConfig } from 'consts/plugins'
import { getPolkawatchConfig } from 'consts/util'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useThemeValues } from 'hooks/useThemeValues'
import { CardWrapper } from 'library/Card/Wrappers'
import { StatusLabel } from 'library/StatusLabel'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonHelp } from 'ui-buttons'
import { CardHeader, Page, Stat } from 'ui-core/base'
import { GeoDonut, GraphWrapper } from 'ui-graphs'
import { NominationGeoList } from './NominationGeoList'
import { AnalyzedDays } from './Stats/AnalyzedDays'
import { AnalyzedEras } from './Stats/AnalyzedEras'
import { AnalyzedPayouts } from './Stats/AnalyzedPayouts'
import type { ChainMetadata, NominatorDetail } from './types'
import { GraphsWrapper } from './Wrappers'

export const NominationGeo = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { openHelpTooltip } = useHelp()
	const { isNominating } = useStaking()
	const { pluginEnabled } = usePlugins()
	const { getThemeValue } = useThemeValues()
	const { activeAddress } = useActiveAccount()

	const enabled = pluginEnabled('polkawatch')

	// Polkawatch Analytics chain metadata, contains information about how the decentralization is 1
	// computed for this particular blockchain
	const [networkMeta, setNetworkMeta] = useState<ChainMetadata>(
		{} as ChainMetadata,
	)

	const [nominationDetail, setNominationDetail] = useState<NominatorDetail>(
		{} as NominatorDetail,
	)

	const [analyticsAvailable, setAnalyticsAvailable] = useState<boolean>(true)

	const networkSupported = PolkawatchConfig.SupportedNetworks.includes(network)

	// Min height of the graph container.
	const graphContainerMinHeight = analyticsAvailable ? 320 : 25

	// Donut size and legend height.
	const donutSize = '300px'
	const legendHeight = 50
	const maxLabelLen = 10

	// Status label config.
	const showDisabledLabel = !enabled
	const showNotNominatingLabel = enabled && !isNominating
	const showNotAvailableLabel = enabled && !analyticsAvailable && isNominating

	// Whether to interact with Polkawatch API.
	const callPolkawatchApi = networkSupported && enabled && isNominating

	useEffect(() => {
		if (callPolkawatchApi) {
			const polkaWatchApi = new PolkawatchApi(getPolkawatchConfig(network))
			polkaWatchApi
				.ddpIpfsAboutChain()
				.then((response) => {
					setAnalyticsAvailable(true)
					setNetworkMeta(response.data)
				})
				.catch(() => {
					setNetworkMeta({} as ChainMetadata)
					setAnalyticsAvailable(false)
				})
		} else {
			setNetworkMeta({} as ChainMetadata)
			setAnalyticsAvailable(false)
		}
	}, [activeAddress, network, enabled, isNominating])

	// NOTE: The list of dependencies assume that changing network
	// triggers a change of account also (i.e. different network prefix).
	useEffect(() => {
		if (callPolkawatchApi) {
			const polkaWatchApi = new PolkawatchApi(getPolkawatchConfig(network))
			polkaWatchApi
				.ddpIpfsNominatorDetail({
					lastDays: 30,
					nominator: activeAddress,
				})
				.then((response) => {
					setAnalyticsAvailable(true)
					setNominationDetail(response.data)
				})
				.catch(() => {
					setNominationDetail({} as NominatorDetail)
					setAnalyticsAvailable(false)
				})
		} else {
			setNominationDetail({} as NominatorDetail)
			setAnalyticsAvailable(false)
		}
	}, [activeAddress, network, enabled, isNominating])

	return (
		<>
			<Stat.Row>
				<AnalyzedDays />
				<AnalyzedEras meta={networkMeta} />
				<AnalyzedPayouts data={nominationDetail} />
			</Stat.Row>
			<Page.Row>
				<CardWrapper>
					<CardHeader>
						<h4>
							{t('payoutDistribution', { ns: 'pages' })}
							<ButtonHelp
								marginLeft
								definition="Nomination Payout Distribution"
								openHelp={openHelpTooltip}
							/>
						</h4>
						<h2>{t('byRegionCountryNetwork', { ns: 'pages' })}</h2>
					</CardHeader>
					<GraphsWrapper style={{ minHeight: graphContainerMinHeight }}>
						{showDisabledLabel && (
							<StatusLabel
								status="active_service"
								statusFor="polkawatch"
								title={t('polkawatchDisabled', {
									ns: 'pages',
								})}
							/>
						)}
						{showNotNominatingLabel && (
							<StatusLabel
								status="no_data"
								title={t('notNominating', {
									ns: 'app',
								})}
							/>
						)}
						{showNotAvailableLabel && (
							<StatusLabel
								status="no_analytic_data"
								title={
									networkSupported
										? t('analyticsNotAvailable', {
												ns: 'pages',
											})
										: t('analyticsNotSupported', {
												ns: 'pages',
											})
								}
							/>
						)}
						{enabled && analyticsAvailable && (
							<>
								<GraphWrapper>
									<GeoDonut
										title={t('rewards')}
										series={nominationDetail.topRegionalDistributionChart}
										maxHeight={donutSize}
										width={donutSize}
										legendHeight={legendHeight}
										maxLabelLen={0}
										getThemeValue={getThemeValue}
									/>
								</GraphWrapper>
								<GraphWrapper>
									<GeoDonut
										title={t('rewards')}
										series={nominationDetail.topCountryDistributionChart}
										maxHeight={donutSize}
										width={donutSize}
										legendHeight={legendHeight}
										maxLabelLen={maxLabelLen}
										getThemeValue={getThemeValue}
									/>
								</GraphWrapper>
								<GraphWrapper>
									<GeoDonut
										title={t('rewards')}
										series={nominationDetail.topNetworkDistributionChart}
										maxHeight={donutSize}
										width={donutSize}
										legendHeight={legendHeight}
										maxLabelLen={maxLabelLen}
										getThemeValue={getThemeValue}
									/>
								</GraphWrapper>
							</>
						)}
					</GraphsWrapper>
				</CardWrapper>
			</Page.Row>
			{nominationDetail?.nodeDistributionDetail && (
				<Page.Row>
					<CardWrapper>
						<NominationGeoList
							title={t('decentralizationPerNomination', {
								ns: 'pages',
							})}
							data={nominationDetail}
						/>
					</CardWrapper>
				</Page.Row>
			)}
		</>
	)
}
