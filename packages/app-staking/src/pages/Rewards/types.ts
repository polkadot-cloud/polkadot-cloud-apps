// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RewardResults } from 'plugin-staking-api/types'
import type { Dispatch, SetStateAction } from 'react'
import type { GraphPayoutData } from 'ui-graphs/types'

export type PayoutHistoryProps = PageProps & {
	loading: boolean
	payoutGraphData: PayoutGraphData
}

export type PayoutGraphData = GraphPayoutData
export interface PageProps {
	payoutsList: RewardResults
	setPayoutsList: Dispatch<SetStateAction<RewardResults>>
}

export type RewardsKind = 'nominator' | 'pool'

export interface RemotePagination {
	page: number
	hasNext: boolean
	setPage: Dispatch<SetStateAction<number>>
}

export interface PayoutListProps {
	allowMoreCols?: boolean
	pagination?: boolean
	title?: string | null
	itemsPerPage: number
	payouts: RewardResults
	endBadge?: string
	loading?: boolean
	remotePagination?: RemotePagination
}

export interface CalculatorMetrics {
	currentStake: number
	averageRewardRate: number
	isInPool: boolean
	historicalRewards: {
		total: number
		totalUsdt: number
	}
}
