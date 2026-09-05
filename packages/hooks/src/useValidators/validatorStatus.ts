// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId, ServiceInterface } from 'types'
import { createSingletonStore } from '../util'

interface ValidatorStatus {
	network: NetworkId
	serviceApi: ServiceInterface
	accountsKey: string
	validators: Set<string>
	checkedAddresses: Set<string>
}

export const validatorStatusStore = createSingletonStore<
	ValidatorStatus | undefined
>(undefined)

export const syncValidatorStatus = async (
	network: NetworkId,
	serviceApi: ServiceInterface,
	addresses: string[],
) => {
	const uniqueAddresses = [...new Set(addresses)].sort()
	const accountsKey = JSON.stringify(uniqueAddresses)
	const current = validatorStatusStore.getSnapshot()
	if (
		current?.network === network &&
		current.serviceApi === serviceApi &&
		current.accountsKey === accountsKey
	) {
		return
	}

	// Share both pending and completed queries across all useValidators consumers.
	const request: ValidatorStatus = {
		network,
		serviceApi,
		accountsKey,
		validators: new Set(),
		checkedAddresses: new Set(),
	}
	validatorStatusStore.setSnapshot(request)
	const results = await Promise.allSettled(
		uniqueAddresses.map(async (address) =>
			serviceApi.query.validatorExists(address),
		),
	)

	// Discard results if the network, API connection or imported accounts changed.
	if (validatorStatusStore.getSnapshot() !== request) {
		return
	}
	validatorStatusStore.setSnapshot({
		...request,
		checkedAddresses: new Set(uniqueAddresses),
		validators: new Set(
			uniqueAddresses.filter((_, index) => {
				const result = results[index]
				return result.status === 'fulfilled' && result.value
			}),
		),
	})
}
