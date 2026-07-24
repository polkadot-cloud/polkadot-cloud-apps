// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { Locale } from 'date-fns'
import type {
	NominatorReward,
	PoolReward,
	RewardResults,
	ValidatorEraPoints,
} from 'plugin-staking-api/types'

export interface PieProps {
	color1?: string
	color2?: string
}

export interface EraPointsLineProps {
	entries: ValidatorEraPoints[]
	syncing: boolean
	width: string | number
	height: string | number
	getThemeValue: (key: string) => string
	dateFormat: Locale
	labels: {
		date: string
		era: string
		eraPoints: string
	}
}
export interface PayoutBarProps {
	days: number
	height: string
	data: GraphPayoutData
	nominating: boolean
	inPool: boolean
	syncing: boolean
	// Theme and translation props
	getThemeValue: (key: string) => string
	unit: string
	units: number
	dateFormat: Locale
	labels: {
		payout: string
		poolClaim: string
		unclaimedPayouts: string
		pending: string
		poolShare: string
	}
	activeAccount?: string
}

export interface PayoutLineProps {
	entries: PayoutLineEntry[]
	syncing: boolean
	width: string | number
	height: string | number
	getThemeValue: (key: string) => string
	unit: string
	dateFormat: Locale
	labels: {
		era: string
		reward: string
		payouts: string
	}
}

export interface PoolSharesBarProps {
	days: number
	entries: PoolReward[]
	claimedEntries: PoolReward[]
	syncing: boolean
	height: string
	hideYAxisLabels?: boolean
	getThemeValue: (key: string) => string
	unit: string
	units: number
	dateFormat: Locale
	labels: {
		poolShares: string
		claim: string
		claimed: string
	}
}

export interface PayoutLineEntry {
	era: number
	reward: string
	start: number
}

export interface AveragePayoutLineProps {
	days: number
	average: number
	height: string
	background?: string
	data: GraphPayoutData
	// Theme and translation props
	getThemeValue: (key: string) => string
	unit: string
	units: number
	labels: {
		payout: string
		dayAverage: string
	}
}

export interface GraphPayoutData {
	payouts: NominatorReward[]
	unclaimedPayouts: NominatorReward[]
	poolClaims: PoolReward[]
	// Optional per-era pool reward share entries rendered as filled vertical bars using box annotations
	poolShareRewards?: PoolReward[]
}

export interface GeoDonutProps {
	title: string
	series: {
		labels: string[]
		data: number[]
	}
	width?: string | number
	maxHeight?: string | number
	legendHeight?: number
	maxLabelLen?: number
	// Theme props
	getThemeValue: (key: string) => string
}

export interface HalvingLineProps {
	getThemeValue: (key: string) => string
	label: string
	tooltipLabel: (value: number) => string
	millionUnit: string
}

export interface PayoutDayCursor {
	reward: BigNumber
}

export interface RewardRecord {
	reward: string
	timestamp: number
}

export interface FormatRewardsConfig {
	fromDate: Date
	days: number
	units: number
	payouts: NominatorReward[]
	poolClaims: PoolReward[]
	unclaimedPayouts: NominatorReward[]
}

export interface DailyPayoutConfig {
	payouts: RewardResults
	fromDate: Date
	maxDays: number
	units: number
	subject: 'pools' | 'nominate'
}

export interface ProcessPayoutsConfig {
	payouts: RewardResults
	fromDate: Date
	days: number
	units: number
	subject: 'pools' | 'nominate'
}
