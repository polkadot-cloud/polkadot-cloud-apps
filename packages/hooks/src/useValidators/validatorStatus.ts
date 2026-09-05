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
	let request: ValidatorStatus = {
		network,
		serviceApi,
		accountsKey,
		validators: new Set(),
		checkedAddresses: new Set(),
	}
	validatorStatusStore.setSnapshot(request)
	await Promise.all(
		uniqueAddresses.map(async (address) => {
			let isValidator = false
			try {
				isValidator = await serviceApi.query.validatorExists(address)
			} catch {
				// Failed lookups finish loading without identifying a validator.
			}

			// Only this batch's latest snapshot may receive its remaining results.
			if (validatorStatusStore.getSnapshot() !== request) {
				return
			}
			request = {
				...request,
				checkedAddresses: new Set(request.checkedAddresses).add(address),
				validators: isValidator
					? new Set(request.validators).add(address)
					: request.validators,
			}
			validatorStatusStore.setSnapshot(request)
		}),
	)
}
