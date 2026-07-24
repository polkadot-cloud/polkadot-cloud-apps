// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveStaker } from 'hooks/useActiveStaker'
import { useBalances } from 'hooks/useBalances'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import type { BondFor, MaybeAddress, NominationStatus } from 'types'
import { getPoolNominationStatusCode, groupNomineesByStatus } from 'utils'

export const useNominationStatus = () => {
	const { t } = useTranslation()
	const { isNominator } = useStaking()
	const { pluginEnabled } = usePlugins()
	const { getNominations } = useBalances()
	const { syncing } = useSyncing(['era-stakers'])
	const { activePoolNominations } = useActivePool()
	const { bondedPools, poolsNominations } = useBondedPools()
	const { getNominationsStatusFromEraStakers } = useEraStakers()
	const { activeNominatorData, activePoolData } = useActiveStaker()

	// Utility to get an account's nominees alongside their status
	const getNominationSetStatus = (
		who: MaybeAddress,
		bondFor: BondFor,
	): Record<string, NominationStatus> => {
		if (pluginEnabled('staking_api')) {
			const activeStatus =
				bondFor === 'nominator' ? activeNominatorData : activePoolData

			// convert statuses into record of string -> status
			const statuses = activeStatus?.statuses.reduce(
				(acc: Record<string, NominationStatus>, { address, status }) => {
					acc[address] = status as NominationStatus
					return acc
				},
				{},
			)
			return statuses || {}
		} else {
			return getNominationsStatusFromEraStakers(
				who,
				bondFor === 'nominator'
					? getNominations(who)
					: (activePoolNominations?.targets ?? []),
			)
		}
	}

	// Gets the status of the provided account's nominations, and whether they are earning rewards
	const getNominationStatus = (who: MaybeAddress, type: BondFor) => {
		// Get the sets nominees from the provided account's targets and categorise
		// them in a single pass (active / inactive / waiting).
		const nominees = Object.entries(getNominationSetStatus(who, type))
		const grouped = groupNomineesByStatus(nominees)
		const earningRewards = grouped.active.length > 0

		// Determine the localised message to display based on the nomination status
		let message

		const isSyncing =
			(syncing && !pluginEnabled('staking_api')) ||
			activeNominatorData === undefined

		const displayNotNominating = pluginEnabled('staking_api')
			? !activeNominatorData?.active
			: !isNominator

		if (displayNotNominating || isSyncing) {
			message = t('notNominating', { ns: 'pages' })
		} else if (!nominees.length) {
			message = t('noNominationsSet', { ns: 'pages' })
		} else if (grouped.active.length) {
			message = t('nominatingAnd', { ns: 'pages' })
			if (earningRewards) {
				message += ` ${t('earningRewards', { ns: 'pages' })}`
			} else {
				message += ` ${t('notEarningRewards', { ns: 'pages' })}`
			}
		} else {
			message = t('waitingForActiveNominations', { ns: 'pages' })
		}

		return {
			nominees: grouped,
			earningRewards,
			message,
			syncing: isSyncing,
		}
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

	return {
		getNominationStatus,
		getNominationSetStatus,
		getPoolNominationStatus,
	}
}
