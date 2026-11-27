// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorListFilters } from 'plugin-staking-api/types'

export interface BrowserFilters
	extends Pick<ValidatorListFilters, 'active' | 'matchAny'> {
	excludeBlocked: boolean
	excludeMissingIdentity: boolean
}

export interface ValidatorListConfig {
	filters: BrowserFilters
	order: string
	search: string
}

export const UNFILTERED_CONFIG: ValidatorListConfig = {
	filters: { excludeBlocked: false, excludeMissingIdentity: false },
	order: 'default',
	search: '',
}

export const DEFAULT_VALIDATOR_LIST_CONFIG: ValidatorListConfig = {
	filters: { excludeBlocked: true, excludeMissingIdentity: true },
	order: 'RETAINMENT_HIGH',
	search: '',
}

const missingIdentity = {
	key: 'excludeMissingIdentity',
	group: 'MISSING_IDENTITY',
	label: 'missingIdentity',
} as const
const blockedNominations = {
	key: 'excludeBlocked',
	group: 'BLOCKED_NOMINATIONS',
	label: 'blockedNominations',
} as const
export const exclusionSwitches = [blockedNominations, missingIdentity]

export const getGroupOptions = ({
	active,
	excludeBlocked,
	excludeMissingIdentity,
}: BrowserFilters) =>
	[
		{ ...missingIdentity, disabled: excludeMissingIdentity },
		{ ...blockedNominations, disabled: excludeBlocked },
		{ group: 'ACTIVE', label: 'active', disabled: active !== undefined },
		{ group: 'INACTIVE', label: 'inactive', disabled: active !== undefined },
	] as const

export const filtersChanged = (
	draft: BrowserFilters,
	applied: BrowserFilters,
) =>
	draft.active !== applied.active ||
	draft.matchAny?.join() !== applied.matchAny?.join() ||
	exclusionSwitches.some(({ key }) => draft[key] !== applied[key])

// Keep selections in display order and clear groups disabled by a high-level filter.
export const updateFilters = (
	filters: BrowserFilters,
	changes: Partial<BrowserFilters>,
): BrowserFilters => {
	const next = { ...filters, ...changes }
	const matchAny = getGroupOptions(next)
		.filter(
			({ group, disabled }) => !disabled && next.matchAny?.includes(group),
		)
		.map(({ group }) => group)
	return { ...next, matchAny: matchAny.length ? matchAny : undefined }
}
