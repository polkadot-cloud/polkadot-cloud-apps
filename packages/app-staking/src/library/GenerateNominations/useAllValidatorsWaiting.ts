// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useSyncing } from 'hooks/useSyncing'
import { useMemo } from 'react'
import type { Validator } from 'types'

export const useAllValidatorsWaiting = (nominations: Validator[]) => {
	const {
		eraStakers: { stakers },
	} = useEraStakers()
	const { syncing } = useSyncing(['era-stakers'])

	return useMemo(() => {
		if (syncing || !stakers.length || !nominations.length) {
			return false
		}

		const activeValidators = new Set(stakers.map(({ address }) => address))
		return nominations.every(({ address }) => !activeValidators.has(address))
	}, [nominations, stakers, syncing])
}
