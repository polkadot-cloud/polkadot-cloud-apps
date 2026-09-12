// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorOverviews } from 'data-gate'
import { useMemo } from 'react'
import type { Validator } from 'types'

export const useAllValidatorsWaiting = (nominations: Validator[]) => {
	// Read validator overview activity.
	const { data: overviews } = useValidatorOverviews(
		nominations.map(({ address }) => address),
	)

	return useMemo(() => {
		// Require overview data and at least one nomination before checking.
		if (!overviews || !nominations.length) {
			return false
		}

		// All nominees are waiting when none are active in the current era.
		const active = new Set(overviews.map(([[, address]]) => address))
		return nominations.every(({ address }) => !active.has(address))
	}, [nominations, overviews])
}
