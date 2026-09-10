// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeAddress } from 'types'
import { useEraStakersQuery } from '../eraStakers'
import { fetchEraNomineeStatuses } from './stakingApi'

export const useNomineeStatuses = (who: MaybeAddress, targets: string[]) => {
	const addresses = [...new Set(targets)].sort()
	return useEraStakersQuery({
		key: ['nominees', who, addresses],
		enabled: !!who && addresses.length > 0,
		node: (exposures) => {
			const byValidator = new Map(
				exposures.map(({ keys, val }) => [keys[1], val]),
			)
			return addresses.map((address) => {
				const exposure = byValidator.get(address)
				const backing = exposure?.others.find((other) => other.who === who)
				return {
					address,
					status: !exposure
						? ('waiting' as const)
						: backing
							? ('active' as const)
							: ('inactive' as const),
					activeBacking: backing?.value ?? '0',
				}
			})
		},
		stakingApi: ({ network, signal }, era) =>
			fetchEraNomineeStatuses(network, era, who!, addresses, signal),
	})
}
