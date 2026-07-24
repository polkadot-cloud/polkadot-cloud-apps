// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { SuperOf } from 'types'
import type { PeopleChain } from '../types'
import { identityOfMulti } from './identityOfMulti'

export const superOfMulti = async <T extends PeopleChain>(
	api: DedotClient<T>,
	addresses: string[],
	ss58: number,
): Promise<SuperOf[]> => {
	const result = (await api.query.identity.superOf.multi(addresses))
		.map((item, i) => {
			if (!item) {
				return undefined
			}
			return {
				address: addresses[i],
				account: item[0],
				value: {
					type: item[1]?.type,
					value: 'value' in item[1] ? item[1].value : undefined,
				},
			}
		})
		.filter((item) => item !== undefined)

	// Fetch the identity of the super accounts and inject them into result
	const superAddresses = result.map(({ account }) => account.address(ss58))
	const superIdentities = await identityOfMulti(api, superAddresses)
	const supers = result.map((item, i) => ({
		...item,
		identity: superIdentities[i],
	}))
	return supers
}
