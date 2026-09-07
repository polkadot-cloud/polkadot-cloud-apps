// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ValidatorRetainmentResult,
	ValidatorWarnings,
} from 'plugin-staking-api/types'
import type { Validator } from 'types'
import { clampRate } from 'utils'
import { SunsettingWarnings } from './consts'

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

export const getValidatorsWithHealthIssues = (
	validators: Validator[],
	lowRetainmentValidators: Validator[],
	warnings: ValidatorWarnings,
) => {
	const sunsettingWarnings = SunsettingWarnings.map(({ type, messageKey }) => ({
		type,
		messageKey,
		validators: validators.filter(({ address }) =>
			warnings[address]?.includes(type),
		),
	})).filter(({ validators }) => validators.length > 0)
	const sunsettingAddresses = new Set(
		sunsettingWarnings.flatMap(({ validators }) =>
			validators.map(({ address }) => address),
		),
	)
	const sunsettingValidators = validators.filter(({ address }) =>
		sunsettingAddresses.has(address),
	)
	const issueAddresses = new Set(
		[...lowRetainmentValidators, ...sunsettingValidators].map(
			({ address }) => address,
		),
	)
	return {
		sunsettingValidators,
		sunsettingWarnings,
		validatorsWithIssues: validators.filter(({ address }) =>
			issueAddresses.has(address),
		),
	}
}
