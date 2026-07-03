// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSize } from '@w3ux/hooks'
import { useActivePool } from 'hooks/useActivePool'
import { useDateFormat } from 'hooks/useDateFormat'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useUi } from 'hooks/useUi'
import { StatusLabel } from 'library/StatusLabel'
import type { PayoutHistoryProps } from 'pages/Rewards/types'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CardHeader } from 'ui-core/base'
import { GraphWrapper } from 'ui-graphs'
import { getPayoutsFromDate, getPayoutsToDate } from 'ui-graphs/util'
import { formatSize } from 'utils'
import { ActiveGraph } from './ActiveGraph'
import { InactiveGraph } from './InactiveGraph'

export const AccountPayouts = ({
	payoutsList,
	setPayoutsList,
	payoutGraphData,
	loading,
}: PayoutHistoryProps) => {
	const { i18n, t } = useTranslation(['pages', 'app'])
	const { syncing } = useSyncing()
	const { containerRefs } = useUi()
	const { inPool } = useActivePool()
	const { isBonding } = useStaking()
	const { pluginEnabled } = usePlugins()
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	const payoutsFromDate = getPayoutsFromDate(payoutsList, dateFormat)
	const payoutsToDate = getPayoutsToDate(payoutsList, dateFormat)
	const staking = isBonding || inPool
	const notStaking = !syncing && !staking

	const ref = useRef<HTMLDivElement>(null)
	const size = useSize(ref, {
		outerElement: containerRefs?.mainInterface,
	})
	const { width, height, minHeight } = formatSize(size, 280)

	useEffect(() => {
		if (!pluginEnabled('staking_api')) {
			setPayoutsList([])
		}
	}, [pluginEnabled('staking_api')])

	return (
		<>
			<CardHeader>
				<h4>{t('app:yourPayouts')}</h4>
				<h2>
					{payoutsFromDate && payoutsToDate ? (
						<>
							{payoutsFromDate}
							{payoutsToDate !== payoutsFromDate && (
								<>&nbsp;-&nbsp;{payoutsToDate}</>
							)}
						</>
					) : (
						t('none')
					)}
				</h2>
			</CardHeader>
			<div ref={ref} className="inner" style={{ minHeight }}>
				{!pluginEnabled('staking_api') ? (
					<StatusLabel
						status="active_service"
						statusFor="staking_api"
						title={t('stakingApiDisabled')}
						topOffset="30%"
					/>
				) : (
					notStaking && (
						<StatusLabel
							status="sync_or_setup"
							title={t('notStaking')}
							topOffset="30%"
						/>
					)
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
							payoutGraphData={payoutGraphData}
							loading={loading}
						/>
					) : (
						<InactiveGraph />
					)}
				</GraphWrapper>
			</div>
		</>
	)
}
