// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchGetNomineesStatus } from 'plugin-staking-api'
import type { NomineeStatusEntry } from 'plugin-staking-api/types'
import { requestOptions } from '../eraStakers/requestOptions'

export const fetchEraNomineeStatuses = async (
	network: string,
	era: number,
	who: string,
	addresses: string[],
	signal: AbortSignal,
): Promise<NomineeStatusEntry[]> => {
	// Match the resolver's limit while supporting larger caller-supplied sets.
	const statuses: NomineeStatusEntry[] = []
	for (let offset = 0; offset < addresses.length; offset += 50) {
		signal.throwIfAborted()
		const batch = addresses.slice(offset, offset + 50)
		const data = await fetchGetNomineesStatus(
			network,
			era,
			who,
			batch,
			requestOptions(signal),
		)
		const entries = data.getNomineesStatus.statuses
		// The schema guarantees field types, but not a result for every requested address.
		if (
			entries.length !== batch.length ||
			batch.some(
				(address) => !entries.some((entry) => entry.address === address),
			)
		) {
			throw new Error('Staking API returned incomplete nominee statuses')
		}
		statuses.push(
			...entries.map((entry) => ({
				...entry,
				status: entry.status === 'invalid' ? 'waiting' : entry.status,
			})),
		)
	}
	return statuses
}
