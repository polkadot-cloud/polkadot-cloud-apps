// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorRetainmentResult } from 'plugin-staking-api/types'
import type { Validator } from 'types'
import { clampRate } from 'utils'

export const getValidatorsWithRetainment = (
	validators: Validator[],
	retainmentByAddress: ReadonlyMap<string, ValidatorRetainmentResult | null>,
) =>
	validators.flatMap((validator) => {
		const rate = retainmentByAddress.get(validator.address)?.retainment
			.threeMonths?.retainmentRate
		return typeof rate === 'number' && Number.isFinite(rate)
			? [{ rate: clampRate(rate), validator }]
			: []
	})
