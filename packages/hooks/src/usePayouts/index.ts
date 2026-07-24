// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { UnclaimedRewards } from 'plugin-staking-api/types'
import { useCallback } from 'react'
import { createSingletonStore, useSingletonStore } from '../util'
import { defaultUnclaimedRewards } from './defaults'
import type { PayoutsHookInterface } from './types'

export { defaultUnclaimedRewards } from './defaults'
export type { PayoutsHookInterface } from './types'

const payoutsStore = createSingletonStore<UnclaimedRewards>(
	defaultUnclaimedRewards,
)

export const usePayouts = (): PayoutsHookInterface => {
	const unclaimedRewards = useSingletonStore(payoutsStore)

	const setUnclaimedRewards = useCallback(
		(unclaimedRewards: UnclaimedRewards) => {
			payoutsStore.setSnapshot(unclaimedRewards)
		},
		[],
	)

	return {
		unclaimedRewards,
		setUnclaimedRewards,
	}
}
