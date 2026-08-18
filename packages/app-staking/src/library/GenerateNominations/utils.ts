// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { clampRate } from 'library/ValidatorList/retainment'
import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import type { Validator } from 'types'

export const getValidatorsWithRetainment = (
	validators: Validator[],
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>,
) =>
	validators.flatMap((validator) => {
		const rate = retainmentByAddress.get(validator.address)?.months[0]
			?.retainmentRate
		return typeof rate === 'number' && Number.isFinite(rate)
			? [{ rate: clampRate(rate), validator }]
			: []
	})
