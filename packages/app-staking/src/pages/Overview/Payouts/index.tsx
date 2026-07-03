// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSize } from '@w3ux/hooks'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { formatDistance, fromUnixTime, getUnixTime } from 'date-fns'
import { useActivePool } from 'hooks/useActivePool'
import { useCurrency } from 'hooks/useCurrency'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useUi } from 'hooks/useUi'
import { Balance } from 'library/Balance'
import { StatusLabel } from 'library/StatusLabel'
import type { RewardResult } from 'plugin-staking-api/types'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardHeader } from 'ui-core/base'
import { GraphWrapper } from 'ui-graphs'
import { formatSize, planckToUnitBn } from 'utils'
import { ActiveGraph } from './ActiveGraph'
import { InactiveGraph } from './InactiveGraph'

export const Payouts = () => {
	const { i18n, t } = useTranslation('pages')
	const { network } = useNetwork()
	const { syncing } = useSyncing()
	const { containerRefs } = useUi()
	const { inPool } = useActivePool()
	const { currency } = useCurrency()
	const { isBonding } = useStaking()
	const { pluginEnabled } = usePlugins()
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	const { units } = getStakingChainData(network)
	const Token = getChainIcons(network).token
	const staking = isBonding || inPool
	const notStaking = !syncing && !staking

	const [lastReward, setLastReward] = useState<RewardResult>()
	// Ref to the graph container
	const graphInnerRef = useRef<HTMLDivElement>(null)

	// Get the size of the graph container
	const size = useSize(graphInnerRef, {
		outerElement: containerRefs?.mainInterface,
	})
	const { width, height, minHeight } = formatSize(size, 260)

	// Memoize date formatting to avoid unnecessary recalculations
	const { formatFrom, formatTo, formatOpts } = useMemo(() => {
		const now = new Date()
		if (lastReward === undefined) {
			return { formatFrom: now, formatTo: now, formatOpts: {} }
		}
		return {
			formatFrom: fromUnixTime(lastReward.timestamp ?? getUnixTime(now)),
			formatTo: now,
			formatOpts: {
				addSuffix: true,
				locale: dateFormat,
			},
		}
	}, [lastReward, dateFormat])

	const lastRewardUnit = planckToUnitBn(
		new BigNumber(lastReward?.reward || 0),
		units,
	).toNumber()

	return (
		<>
			<CardHeader>
				<h4>{t('recentPayouts')}</h4>
				<Balance.WithFiat
					Token={<Token />}
					value={lastRewardUnit}
					currency={currency}
					label={
						lastReward === undefined
							? undefined
							: formatDistance(formatFrom, formatTo, formatOpts)
					}
				/>
			</CardHeader>
			<div className="inner" ref={graphInnerRef} style={{ minHeight }}>
				{!pluginEnabled('staking_api') ? (
					<StatusLabel
						status="active_service"
						statusFor="staking_api"
						title={t('stakingApiDisabled')}
						topOffset="37%"
					/>
				) : (
					<StatusLabel
						status="sync_or_setup"
						title={t('notStaking')}
						topOffset="37%"
					/>
				)}
				<GraphWrapper
					style={{
						height: `${height}px`,
						width: `${width}px`,
						position: 'absolute',
						opacity: notStaking ? 0.75 : 1,
						transition: 'opacity 0.5s',
					}}
				>
					{staking && pluginEnabled('staking_api') ? (
						<ActiveGraph
							nominating={isBonding}
							inPool={inPool}
							lineMarginTop="3rem"
							setLastReward={setLastReward}
						/>
					) : (
						<InactiveGraph setLastReward={setLastReward} />
					)}
				</GraphWrapper>
			</div>
		</>
	)
}
