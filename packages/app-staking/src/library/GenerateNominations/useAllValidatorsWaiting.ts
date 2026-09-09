// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useMemo } from 'react'
import type { Validator } from 'types'

export const useAllValidatorsWaiting = (nominations: Validator[]) => {
	const { validatorOverviews } = useEraStakers()

	return useMemo(() => {
		if (!validatorOverviews || !nominations.length) {
			return false
		}

		const activeValidators = new Set(validatorOverviews.keys())
		return nominations.every(({ address }) => !activeValidators.has(address))
	}, [nominations, validatorOverviews])
}
