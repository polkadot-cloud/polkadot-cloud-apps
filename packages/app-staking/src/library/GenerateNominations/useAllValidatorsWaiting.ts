// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorOverviews } from 'data-gate'
import type { Validator } from 'types'

export const useAllValidatorsWaiting = (nominations: Validator[]) => {
	const { data: overviews } = useValidatorOverviews(
		nominations.map(({ address }) => address),
	)

	return (
		!!overviews &&
		nominations.length > 0 &&
		nominations.every(({ address }) => !overviews.has(address))
	)
}
