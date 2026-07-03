// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { MaybeAddress } from 'types'

export interface CommissionValues {
	commission: number
	payee: MaybeAddress
	maxCommission: number
	changeRate: ChangeRateInput
}

export interface CommissionFeatureFlags {
	maxCommission: boolean
	changeRate: boolean
}

export interface PoolCommissionContextInterface {
	setCommission: Dispatch<SetStateAction<number>>
	setPayee: Dispatch<SetStateAction<MaybeAddress>>
	setMaxCommission: Dispatch<SetStateAction<number>>
	setChangeRate: Dispatch<SetStateAction<ChangeRateInput>>
	setFeatureEnabled: (
		feature: OptionalCommissionFeature,
		enabled: boolean,
	) => void
	initial: CommissionValues
	current: CommissionValues
	enabled: CommissionFeatureFlags
	hasValue: CommissionFeatureFlags
	updated: CommissionFeatureFlags & {
		commission: boolean
		payee: boolean
	}
	resetAll: () => void
}

export interface PoolCommissionProviderProps {
	children: ReactNode
}

export type OptionalCommissionFeature = 'maxCommission' | 'changeRate'

export interface ChangeRateInput {
	maxIncrease: number
	minDelay: number
}
