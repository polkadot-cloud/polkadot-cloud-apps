// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { varToUrlHash } from '@w3ux/utils'
import { isNetworkEnabled } from 'consts/util'
import {
	getAutoRpc,
	getNetwork,
	getProviderType,
	networkConfig$,
	setNetworkConfig,
} from 'global-bus'
import { getInitialRpcEndpoints } from 'global-bus/util'
import { useCallback, useSyncExternalStore } from 'react'
import type { NetworkId } from 'types'
import { createObservableStore } from 'utils'
import type { NetworkHookInterface } from './types'

const networkStore = createObservableStore<NetworkId>(
	networkConfig$,
	getNetwork,
)

export const useNetwork = (): NetworkHookInterface => {
	const network = useSyncExternalStore(
		networkStore.subscribe,
		networkStore.getSnapshot,
		networkStore.getSnapshot,
	)

	const switchNetwork = useCallback(async (name: NetworkId): Promise<void> => {
		if (!isNetworkEnabled(name)) {
			return
		}
		setNetworkConfig(
			name,
			await getInitialRpcEndpoints(name),
			getProviderType(),
			getAutoRpc(),
		)
		varToUrlHash('n', name, false)
	}, [])

	return {
		network,
		switchNetwork,
	}
}
