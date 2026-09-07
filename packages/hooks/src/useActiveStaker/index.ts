// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useNominationStatuses } from 'data-gate/react'
import { aggregateNominationStatus } from 'data-gate/resources/nominations'
import { useActivePool } from '../useActivePool'
import { useBalances } from '../useBalances'
import type { ActiveStakerHookInterface } from './types'

export type { ActiveStakerHookInterface } from './types'

export const useActiveStaker = (): ActiveStakerHookInterface => {
	const { activeAddress } = useActiveAccount()
	const { activePool, activePoolNominations } = useActivePool()
	const { getNominations } = useBalances()
	const nominator = useNominationStatuses(
		activeAddress,
		getNominations(activeAddress),
	)
	const pool = useNominationStatuses(
		activePool?.addresses.stash,
		activePoolNominations?.targets ?? [],
	)
	return {
		activeNominatorStatus:
			nominator.data !== undefined && !nominator.error
				? aggregateNominationStatus(nominator.data ?? {})
				: undefined,
		activePoolStatus:
			pool.data !== undefined && !pool.error
				? aggregateNominationStatus(pool.data ?? {})
				: undefined,
	}
}
