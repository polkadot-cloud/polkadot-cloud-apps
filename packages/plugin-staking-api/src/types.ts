// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ApolloClient,
	ErrorLike,
	OperationVariables,
} from '@apollo/client'

interface Query<T> {
	loading: boolean
	error: ErrorLike | undefined
	refetch: (
		variables?: Partial<OperationVariables> | undefined,
	) => Promise<ApolloClient.QueryResult<T>>
}

export interface QueryReturn<T> extends Query<T> {
	data: T
}

export interface TokenPriceData {
	tokenPrice: TokenPrice
}

export interface TokenPrice {
	price: number
	change: number
}

export interface IdentityCacheData {
	identityCache: IdentityCache[]
}

export interface IdentityCache {
	address: string
	display: string | null
	superDisplay: string | null
	superValue: string | null
	category: string | null
}

export type ValidatorListOrder =
	| 'ACTIVITY'
	| 'RETAINMENT_HIGH'
	| 'RETAINMENT_LOW'

export interface ValidatorListFilters {
	excludeBlocked?: boolean
	excludeMissingIdentity?: boolean
	activeOnly?: boolean
	search?: string
}

export interface ValidatorListVariables extends Record<string, unknown> {
	network: string
	page?: number
	pageSize?: number
	order?: ValidatorListOrder
	filters?: ValidatorListFilters
}

export interface ValidatorListData {
	validatorList: ValidatorListResult
}

export interface ValidatorListResult {
	validators: ValidatorListItem[]
	page: number
	pageSize: number
	total: number
	totalPages: number
	hasNextPage: boolean
	activityEra: number | null
	retainmentEra: number | null
	totalActive: number
}

export interface ValidatorListItem {
	address: string
	prefs: {
		commission: number
		blocked: boolean
	}
	identity: IdentityCache | null
	active: boolean
	selfStake: string | null
	totalStake: string | null
	activeLedger: string | null
	totalLedger: string | null
	activityRank: number | null
	retainment: ValidatorRetainmentPeriod | null
}

export type ValidatorCandidateStrategy =
	| 'ACTIVE'
	| 'HIGH_RETAINER'
	| 'HIGH_COMPOUNDER'

export interface RandomValidatorCandidateVariables
	extends Record<string, unknown> {
	network: string
	strategy: ValidatorCandidateStrategy
	active?: boolean
	excludeAddresses?: string[]
	topPercent?: number
}

export interface RandomValidatorCandidateData {
	randomValidatorCandidate: Pick<ValidatorListItem, 'address' | 'prefs'> | null
}

export interface AllRewardsData {
	allRewards: NominatorReward[]
}

export interface NominatorReward {
	era: number
	reward: string
	claimed: boolean
	timestamp: number
	validator: string
	type: string
}

export interface UnclaimedRewardsData {
	unclaimedRewards: UnclaimedRewards
}

export interface ValidatorRewardsData {
	validatorRewards: ValidatorReward[]
}

export interface ValidatorReward {
	era: number
	reward: string
	start: number
}

export interface PoolRewardData {
	poolRewards: PoolReward[]
}

export interface CombinedPoolRewardsData {
	combinedPoolRewards: CombinedPoolRewardsResult
}

export interface CombinedPoolRewardsResult {
	entries: CombinedPoolReward[]
	nextCursor: string | null
	hasNextPage: boolean
}

export interface PoolEraRewardsData {
	poolEraRewards: PoolReward[]
}

export interface EraTotalNominatorsData {
	eraTotalNominators: {
		totalNominators: number
	}
}

export interface NominatorRewardTrendData {
	nominatorRewardTrend: RewardTrend
}

export interface PoolRewardTrendData {
	poolRewardTrend: RewardTrend
}

export interface PayeeNominatorRewardsData {
	payeeNominatorRewards: PayeeNominatorRewardsResult
}

export interface PayeeNominatorRewardsResult {
	total: string
	rewards: PayeeEraReward[]
	active: PayeeNominatorReward[]
}

export interface PayeeEraReward {
	era: number
	reward: string
}

export interface PayeeNominatorReward {
	address: string
	label: string | null
	stakedBalance: string
	validatorApy: number
	incomingPayouts: string
}

export interface RewardTrend {
	reward: string
	previous: string
	change: {
		percent: string
		value: string
	}
}

export interface ActiveValidatorRanksData {
	activeValidatorRanks: ActiveValidatorRank[]
}

export interface ActiveValidatorRank {
	validator: string
	rank: number
}

export interface ValidatorEraPointsData {
	validatorEraPoints: ValidatorEraPoints[]
}

export interface UnclaimedRewards {
	total: string
	entries: EraUnclaimedReward[]
}
export interface EraUnclaimedReward {
	era: number
	reward: string
	validators: ValidatorUnclaimedReward[]
}

export interface ValidatorUnclaimedReward {
	validator: string
	reward: string
	page: number | null
}

export interface ValidatorEraPoints {
	era: number
	validator: string
	points: string
	start: number
}

export interface ValidatorEraPointsBatchData {
	validatorEraPointsBatch: ValidatorEraPointsBatch[]
}

export interface ValidatorEraPointsBatch {
	validator: string
	points: ValidatorEraPoints[]
}

export interface ValidatorAvgRewardRateBatchData {
	validatorAvgRewardRateBatch: ValidatorAvgRewardRateBatch[]
}

export interface ValidatorAvgRewardRateBatch {
	validator: string
	rate: number
}

export interface ValidatorRetainmentBatchData {
	validatorRetainmentBatch: ValidatorRetainmentBatch[]
}

export interface ValidatorRetainmentBatch {
	validator: string
	result: ValidatorRetainmentResult | null
}

export interface ValidatorRetainmentResult {
	identityGraphId: string
	accounts: ValidatorRetainmentAccount[]
	validators: string[]
	era: number
	timestamp: number
	assetHubBlockNumber: number
	peopleBlockNumber: number
	months: ValidatorRetainmentPeriod[]
}

export interface ValidatorRetainmentAccount {
	address: string
	super: string | null
	subs: string[]
	validator: boolean
}

export interface ValidatorRetainmentPeriod {
	month: number
	year: number
	fromEra: number
	toEra: number
	fromTimestamp: number
	toTimestamp: number
	graphRewards: string
	netInflow: string
	retained: string
	retainmentRate: number | null
	validatorRewards: string
	selfStakeChange: string
	compounded: string
	compoundRate: number
}

export interface ValidatorDetailsBatchData
	extends ValidatorRetainmentBatchData,
		ValidatorAvgRewardRateBatchData,
		ValidatorEraPointsBatchData {}

export interface PoolReward {
	reward: string
	timestamp: number
	who: string
	poolId: number
	source?: string
}

export interface CombinedPoolReward extends PoolReward {
	source: string
}

export interface PoolEraPointsData {
	poolEraPoints: PoolEraPoints[]
}

export interface PoolEraPoints {
	era: number
	points: string
	start: number
}

export interface PoolCandidatesData {
	poolCandidates: number[]
}

export interface PoolMembersData {
	poolMembers: PoolMembers
}

export interface PoolMembers {
	poolId: number
	totalMembers: number
	members: PoolMember[]
}

export interface PoolMember {
	poolId: number
	address: string
	points: bigint
	unbondingEras: {
		era: number
		amount: string
	}[]
}

export interface PayoutsAndClaims extends Array<NominatorReward | PoolReward> {}

export type RewardResult = NominatorReward | PoolReward
export interface RewardResults extends Array<RewardResult> {}

export interface AverageRewardRateResult {
	rate: number
}

export interface ValidatorRanksResult
	extends Array<{ validator: string; rank: number }> {}

export interface ValidatorStatsData {
	validatorStats: ValidatorStats
}

export interface ValidatorStats {
	averageRewardRate: AverageRewardRateResult
	activeValidatorRanks: ValidatorRanksResult
}

export interface RpcEndpointHealthData {
	rpcEndpointHealth: RpcEndpointChainHealth
}

export interface RpcEndpointChainHealth {
	chains: {
		chain: string
		endpoints: {
			label: string
			url: string
		}[]
	}[]
}

export interface RpcHealthLabels {
	chains: {
		chain: string
		endpoints: string[]
	}[]
}

export interface SearchValidatorsData {
	searchValidators: SearchValidators
}

export interface SanitizeNomineeCandidatesData {
	sanitizeNomineeCandidates: SanitizeNomineeCandidate[]
}

export interface SanitizeNomineeCandidate {
	address: string
	prefs: SanitizeNomineeCandidatePrefs
}

export interface SanitizeNomineeCandidatePrefs {
	commission: number
	blocked: boolean
}

export interface SearchValidators {
	total: number
	validators: {
		address: string
		commission: number
		blocked: boolean
		display: string
		superDisplay: string
	}[]
}

export interface GetActiveStakerWithNomineesData {
	isActiveStaker: {
		active: boolean
	}
	getNomineesStatus: {
		statuses: {
			address: string
			status: string
		}[]
	}
}
export interface ActiveStatusWithNominees {
	active: boolean
	statuses: {
		address: string
		status: string
	}[]
}

export type StakerNominationStatus = 'active' | 'inactive' | 'waiting'

export interface GetNominationStatusData {
	getNominationStatus: StakerNominationStatus
}

export type PoolWarningType =
	| 'DESTROYING'
	| 'NO_CHANGE_RATE'
	| 'HIGH_COMMISSION'

export interface PoolWarningsData {
	poolWarnings: {
		warnings: ApiPoolWarning[]
	}
}

export interface ApiPoolWarning {
	poolId: number
	address: string
	warningTypes: PoolWarningType[]
}

export interface PoolWarningsResult {
	warnings: ApiPoolWarning[]
}
