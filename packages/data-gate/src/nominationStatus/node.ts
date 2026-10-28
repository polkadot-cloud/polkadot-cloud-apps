// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NodeFetcher } from './types'

export const fetchNode: NodeFetcher = async (node, era, who, signal) => {
	// Fetch the stash's current nominees before reading their exposures.
	const [nominations] = await node.query.nominatorsMulti([who])

	// Stop cancelled requests before starting further node reads.
	signal.throwIfAborted()

	// Read each distinct target once, without scanning the full validator set.
	const statuses = await Promise.all(
		[...new Set(nominations?.targets ?? [])].map(async (target) => {
			const overview = await node.query.erasStakersOverview(era, target)
			signal.throwIfAborted()

			// Targets without an overview are waiting for election into an active era.
			if (!overview) return 'waiting'

			// Backing can appear on any exposure page, so wait for the complete set.
			const pages = await node.query.erasStakersPagedEntries(era, target)
			signal.throwIfAborted()

			if (pages.length !== overview.pageCount) {
				throw new Error(`Incomplete exposure pages for ${target}`)
			}

			// An elected target is active for this stash only if it includes their stake.
			return pages.some(([, { others }]) =>
				others.some((other) => other.who === who),
			)
				? 'active'
				: 'inactive'
		}),
	)

	// Prefer active backing, then inactive nominees; an empty set is waiting.
	return statuses.includes('active')
		? 'active'
		: statuses.includes('inactive')
			? 'inactive'
			: 'waiting'
}
