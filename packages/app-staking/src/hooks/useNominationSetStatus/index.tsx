// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import type { BondFor, MaybeAddress, NominationStatus } from 'types'
import { getPoolNominationStatusCode } from 'utils'

// Per-validator lists still use the legacy exposure data.
export const useNominationSetStatus = () => {
	const { getNominations } = useBalances()
	const { activePoolNominations } = useActivePool()
	const { bondedPools, poolsNominations } = useBondedPools()
	const { getNominationsStatusFromEraStakers } = useEraStakers(true)

	// Utility to get an account's nominees alongside their status
	const getNominationSetStatus = (
		who: MaybeAddress,
		bondFor: BondFor,
	): Record<string, NominationStatus> => {
		return getNominationsStatusFromEraStakers(
			who,
			bondFor === 'nominator'
				? getNominations(who)
				: (activePoolNominations?.targets ?? []),
		)
	}

	// Get bonded pool nomination statuses
	const getPoolNominationStatus = (
		nominator: MaybeAddress,
		nomination: MaybeAddress,
	): NominationStatus => {
		const pool = bondedPools.find((p) => p.addresses.stash === nominator)
		if (!pool) {
			return 'waiting'
		}
		// get pool targets from nominations metadata
		const nominations = poolsNominations[pool.id]
		const targets = nominations ? nominations.targets : []
		const target = targets.find((item) => item === nomination)
		if (!target) {
			return 'waiting'
		}
		const nominationStatus = getNominationsStatusFromEraStakers(nominator, [
			target,
		])
		return getPoolNominationStatusCode(nominationStatus)
	}

	return { getNominationSetStatus, getPoolNominationStatus }
}
