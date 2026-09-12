// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { ErasStakersOverviewEntries, Validator } from 'types'

// Lists fetch one scoped snapshot and pass each row its overview, including loading/absent states.
export const injectValidatorListData = (
	validators: Validator[],
	overviews: ErasStakersOverviewEntries | undefined,
): ValidatorListEntry[] => {
	const byAddress =
		overviews &&
		new Map(overviews.map(([[, address], entry]) => [address, entry]))
	return validators.map((validator) => ({
		...validator,
		overview: byAddress
			? (byAddress.get(validator.address) ?? null)
			: undefined,
		validatorStatus: byAddress?.has(validator.address) ? 'active' : 'waiting',
	}))
}
