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
import { useValidatorStatus } from 'hooks/useValidatorStatus'
import { useTranslation } from 'react-i18next'
import type { BondFor, MaybeAddress, NominationStatus } from 'types'
import { getPoolNominationStatusCode, groupNomineesByStatus } from 'utils'

export const useNominationStatus = () => {
	const { t } = useTranslation()
	const { isNominator } = useStaking()
	const { pluginEnabled } = usePlugins()
	const { getNominations } = useBalances()
	const { isValidator } = useValidatorStatus()
	const { syncing } = useSyncing(['era-stakers'])
	const { activePoolNominations } = useActivePool()
	const { bondedPools, poolsNominations } = useBondedPools()
	const { getNominationsStatusFromEraStakers } = useEraStakers()
	const { activeNominatorStatus, activePoolStatus } = useActiveStaker()

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

	// Gets the status of the provided account's nominations, and whether they are earning rewards
	const getNominationStatus = (who: MaybeAddress, type: BondFor) => {
		// Get the sets nominees from the provided account's targets and categorise
		// them in a single pass (active / inactive / waiting).
		const nominees = Object.entries(getNominationSetStatus(who, type))
		const grouped = groupNomineesByStatus(nominees)
		const stakingApiEnabled = pluginEnabled('staking_api')
		const apiStatus =
			type === 'nominator' ? activeNominatorStatus : activePoolStatus
		const status = stakingApiEnabled
			? apiStatus
			: grouped.active.length
				? 'active'
				: grouped.inactive.length
					? 'inactive'
					: 'waiting'
		const earningRewards = status === 'active'

		// Determine the localised message to display based on the nomination status
		let message

		const isSyncing = stakingApiEnabled ? status === undefined : syncing

		if (type === 'nominator' && isValidator) {
			message = t('youAreValidator', { ns: 'app' })
		} else if (!isNominator || isSyncing) {
			message = t('notNominating', { ns: 'pages' })
		} else if (!nominees.length) {
			message = t('noNominationsSet', { ns: 'pages' })
		} else if (status === 'active') {
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
			status,
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
