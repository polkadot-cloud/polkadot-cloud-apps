// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ValidatorListFilters,
	ValidatorListGroup,
} from 'plugin-staking-api/types'

export interface BrowserFilters
	extends Pick<ValidatorListFilters, 'active' | 'matchAny'> {
	excludeBlocked: boolean
	excludeMissingIdentity: boolean
}

export const getGroupOptions = ({
	active,
	excludeBlocked,
	excludeMissingIdentity,
}: BrowserFilters) =>
	[
		{
			group: 'MISSING_IDENTITY',
			label: 'missingIdentity',
			disabled: excludeMissingIdentity,
		},
		{
			group: 'BLOCKED_NOMINATIONS',
			label: 'blockedNominations',
			disabled: excludeBlocked,
		},
		{ group: 'ACTIVE', label: 'active', disabled: active !== undefined },
		{ group: 'INACTIVE', label: 'inactive', disabled: active !== undefined },
	] as const satisfies ReadonlyArray<{
		group: ValidatorListGroup
		label: string
		disabled: boolean
	}>

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
