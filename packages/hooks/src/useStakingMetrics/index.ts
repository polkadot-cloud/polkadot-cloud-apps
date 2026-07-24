// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defaultStakingMetrics, stakingMetrics$ } from 'global-bus'
import { useSyncExternalStore } from 'react'
import type { StakingMetrics } from 'types'
import { createObservableStore } from 'utils'

const stakingMetricsStore = createObservableStore<StakingMetrics>(
	stakingMetrics$,
	defaultStakingMetrics,
)

// Subscribes only to staking metrics. Kept separate from `useApi` because staking metrics (e.g.
// `totalIssuance`) emit a new object roughly every block; bundling this subscription into `useApi`
// re-rendered every one of its ~90 consumers on each emission.
export const useStakingMetrics = (): StakingMetrics =>
	useSyncExternalStore(
		stakingMetricsStore.subscribe,
		stakingMetricsStore.getSnapshot,
		stakingMetricsStore.getSnapshot,
	)
