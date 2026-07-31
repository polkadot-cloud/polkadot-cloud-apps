// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNomineesInEra } from 'plugin-staking-api'
import type { MaybeAddress } from 'types'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'
import { usePlugins } from '../usePlugins'
import type { NominationGroupsData } from './types'

export type { NominationGroupsData } from './types'

export const partitionNominees = (
	liveNominees: string[],
	nomineesInEra: string[] | null,
): NominationGroupsData<string> => {
	if (nomineesInEra === null) {
		return {
			continuing: liveNominees,
			leaving: [],
			added: [],
			hasChanges: false,
			hasActiveEraData: false,
		}
	}

	const liveSet = new Set(liveNominees)
	const nomineesInEraSet = new Set(nomineesInEra)
	const leaving = nomineesInEra.filter((address) => !liveSet.has(address))
	const added = liveNominees.filter((address) => !nomineesInEraSet.has(address))

	return {
		continuing: liveNominees.filter((address) => nomineesInEraSet.has(address)),
		leaving,
		added,
		hasChanges: leaving.length > 0 || added.length > 0,
		hasActiveEraData: true,
	}
}

export const useNominationGroups = (
	nominator: MaybeAddress,
	liveNominees: string[],
): NominationGroupsData<string> => {
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const canQuery =
		stakingApiEnabled && activeEra.index > 0 && nominator !== null

	const { data, loading, error } = useNomineesInEra({
		network,
		era: activeEra.index,
		who: nominator || '',
		skip: !canQuery,
	})

	// Keep rendering live nominations while the query is unavailable or in flight. This also makes
	// the new endpoint safe to deploy independently from the app.
	const nomineesInEra =
		canQuery && !loading && !error ? data.nomineesInEra : null

	return partitionNominees(liveNominees, nomineesInEra)
}
