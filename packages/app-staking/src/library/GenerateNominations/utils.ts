// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ValidatorRetainmentResult,
	ValidatorWarnings,
	ValidatorWarningType,
} from 'plugin-staking-api/types'
import type { Validator } from 'types'
import { clampRate, getRetainmentStatus } from 'utils'
import { ValidatorWarningDefinitions } from './consts'

export interface ValidatorItemWarning {
	type: ValidatorWarningType | 'LOW_RETAINMENT'
	labelKey: string
	severity: 'danger' | 'warning'
}

// Match the health summary's three-month window, independently of the metric toggle.
export const getValidatorItemWarnings = (
	warnings: ValidatorWarningType[] = [],
	retainment?: ValidatorRetainmentResult | null,
): ValidatorItemWarning[] => {
	const items: ValidatorItemWarning[] = ValidatorWarningDefinitions.filter(
		({ type }) => warnings.includes(type),
	)

	const rate = retainment?.retainment.threeMonths?.retainmentRate

	if (typeof rate === 'number' && Number.isFinite(rate)) {
		const severity = getRetainmentStatus(clampRate(rate))
		if (severity !== 'success') {
			items.push({
				type: 'LOW_RETAINMENT',
				labelKey: 'lowThreeMonthRetainmentWarningLabel',
				severity,
			})
		}
	}

	return items.sort((a, b) =>
		a.severity === b.severity ? 0 : a.severity === 'danger' ? -1 : 1,
	)
}

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

export const getValidatorWarningGroups = (
	validators: Validator[],
	warnings: ValidatorWarnings,
	severity?: 'danger' | 'warning',
) =>
	ValidatorWarningDefinitions.filter(
		(definition) => !severity || definition.severity === severity,
	)
		.map((definition) => ({
			...definition,
			validators: validators.filter(({ address }) =>
				warnings[address]?.includes(definition.type),
			),
		}))
		.filter(({ validators }) => validators.length > 0)

export const getValidatorsWithHealthIssues = (
	validators: Validator[],
	lowRetainmentValidators: Validator[],
	warnings: ValidatorWarnings,
) => {
	const validatorWarningGroups = getValidatorWarningGroups(validators, warnings)
	const flaggedAddresses = new Set(
		validatorWarningGroups
			.filter(({ severity }) => severity === 'danger')
			.flatMap(({ validators }) => validators.map(({ address }) => address)),
	)
	const issueAddresses = new Set([
		...flaggedAddresses,
		...lowRetainmentValidators.map(({ address }) => address),
	])
	return {
		flaggedValidatorCount: flaggedAddresses.size,
		validatorWarningGroups,
		validatorsWithIssues: validators.filter(({ address }) =>
			issueAddresses.has(address),
		),
	}
}
