// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useMemo } from 'react'
import type { Validator } from 'types'

export const useAllValidatorsWaiting = (nominations: Validator[]) => {
	// Read validator overview activity.
	const { validatorOverviews } = useEraStakers()

	return useMemo(() => {
		// Require overview data and at least one nomination before checking.
		if (!validatorOverviews || !nominations.length) {
			return false
		}

		const activeValidators = new Set(validatorOverviews.keys())

		// All nominees are waiting when none are active in the current era.
		return nominations.every(({ address }) => !activeValidators.has(address))
	}, [nominations, validatorOverviews])
}
