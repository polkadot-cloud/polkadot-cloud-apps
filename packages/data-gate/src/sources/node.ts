// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface, Staker } from 'types'

export const readValidatorExposure = async (
	node: ServiceInterface,
	era: number,
	address: string,
): Promise<Staker | null> => {
	const overview = await node.query.erasStakersOverview(era, address)
	if (!overview) return null
	const pages = await node.query.erasStakersPagedEntries(era, address)
	if (pages.length !== overview.pageCount)
		throw new Error(`Incomplete exposure pages for ${address}`)
	return {
		address,
		own: overview.own.toString(),
		total: overview.total.toString(),
		others: pages.flatMap(([, page]) =>
			page.others.map(({ who, value }) => ({ who, value: value.toString() })),
		),
	}
}

// Bound node concurrency when an aggregate genuinely requires the complete exposure set.
export const mapInBatches = async <T, R>(
	items: readonly T[],
	load: (item: T) => Promise<R>,
	batchSize = 8,
): Promise<R[]> => {
	const results: R[] = []
	for (let index = 0; index < items.length; index += batchSize)
		results.push(
			...(await Promise.all(items.slice(index, index + batchSize).map(load))),
		)
	return results
}
