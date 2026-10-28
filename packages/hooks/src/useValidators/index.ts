// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useCallback, useEffect } from 'react'
import type { MaybeAddress } from 'types'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'
import { useSingletonStore } from '../util'
import { syncValidatorStatus, validatorStatusStore } from './validatorStatus'

export const useValidators = () => {
	const { network } = useNetwork()
	const { isReady, serviceApi } = useApi()
	const { accounts } = useImportedAccounts()
	const { activeAddress } = useActiveAccount()
	const validatorStatus = useSingletonStore(validatorStatusStore)
	const currentStatus =
		isReady &&
		validatorStatus?.network === network &&
		validatorStatus.serviceApi === serviceApi
			? validatorStatus
			: undefined

	const isValidator = useCallback(
		(address: MaybeAddress) =>
			Boolean(address && currentStatus?.validators.has(address)),
		[currentStatus],
	)

	const isLoading = useCallback(
		(address: MaybeAddress) =>
			Boolean(address && !currentStatus?.checkedAddresses.has(address)),
		[currentStatus],
	)

	useEffect(() => {
		if (!isReady) {
			if (validatorStatusStore.getSnapshot()) {
				validatorStatusStore.resetSnapshot()
			}
			return
		}
		syncValidatorStatus(network, serviceApi, [
			...accounts.map(({ address }) => address),
			...(activeAddress ? [activeAddress] : []),
		])
	}, [accounts, activeAddress, isReady, network, serviceApi])

	return { isValidator, isLoading }
}
