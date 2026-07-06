// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSize } from '@w3ux/hooks'
import { getStakingChainData } from 'consts/util'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useUi } from 'hooks/useUi'
import { StatusLabel } from 'library/StatusLabel'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GraphInner, Subheading } from 'ui-core/canvas'
import { formatSize } from 'utils'
import type { OverviewSectionProps } from '../../types'
import { ActiveGraph } from './ActiveGraph'
import { InactiveGraph } from './InactiveGraph'

export const Performance = ({ bondedPool }: OverviewSectionProps) => {
	const { activeEra } = useApi()
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { containerRefs } = useUi()
	const { pluginEnabled } = usePlugins()
	const { units } = getStakingChainData(network)
	// Ref to the graph container
	const graphInnerRef = useRef<HTMLDivElement | null>(null)

	// Get the size of the graph container
	const size = useSize(graphInnerRef, {
		outerElement: containerRefs?.mainInterface,
	})
	const { width, height } = formatSize(size, 250)
	return (
		<div>
			<Subheading>
				<h3>{t('rewardHistory', { ns: 'app' })}</h3>
			</Subheading>
			<GraphInner ref={graphInnerRef} width={width} height={height}>
				{pluginEnabled('staking_api') && bondedPool ? (
					<ActiveGraph
						network={network}
						stash={bondedPool.addresses.stash}
						fromEra={Math.max(activeEra.index - 1, 0)}
						width={width}
						height={height}
						units={units}
					/>
				) : (
					<>
						<StatusLabel
							status="active_service"
							statusFor="staking_api"
							title={t('stakingApiDisabled', { ns: 'pages' })}
							topOffset="37%"
						/>
						<InactiveGraph width={width} height={height} />
					</>
				)}
			</GraphInner>
		</div>
	)
}
