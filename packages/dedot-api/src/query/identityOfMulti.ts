// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PalletIdentityRegistration } from 'dedot/chaintypes'
import type { IdentityOf } from 'types'
import type { PeopleChain } from '../types'

export const identityOfMulti = async <T extends PeopleChain>(
	api: DedotClient<T>,
	addresses: string[],
): Promise<IdentityOf[]> => {
	const result = (await api.query.identity.identityOf.multi(addresses)).map(
		(item) => {
			// Handle case where chain state is an array of item and hex string
			if (Array.isArray(item)) {
				return handleArrayItem(item)
			}
			// Handle case where chain state is a single item
			return item
				? {
						info: {
							display: item.info?.display,
						},
						judgements: item.judgements || [[0, { type: 'Unknown' }]],
						deposit: item.deposit,
					}
				: undefined
		},
	)
	return result
}

// Helper function to handle the case where the chain state is an array of items
const handleArrayItem = (
	item: (PalletIdentityRegistration | undefined)[],
): IdentityOf =>
	item[0]
		? {
				info: {
					display: item[0]?.info.display,
				},
				judgements: item[0]?.judgements,
				deposit: item[0]?.deposit,
			}
		: undefined
