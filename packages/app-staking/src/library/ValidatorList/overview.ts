// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorListEntry } from 'contexts/Validators/types'
import type { Validator, ValidatorOverviews } from 'types'

// Lists fetch one scoped snapshot and pass each row its overview, including loading/absent states.
export const injectValidatorListData = (
	validators: Validator[],
	overviews: ValidatorOverviews | undefined,
): ValidatorListEntry[] =>
	validators.map((validator) => ({
		...validator,
		overview: overviews
			? (overviews.get(validator.address) ?? null)
			: undefined,
		validatorStatus: overviews?.has(validator.address) ? 'active' : 'waiting',
	}))
