// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkConfig } from 'types'
import {
	getInitialAutoRpc,
	getInitialNetwork,
	getInitialProviderType,
} from './util'

export const defaultNetworkConfig: NetworkConfig = {
	network: getInitialNetwork(),
	rpcEndpoints: {},
	providerType: getInitialProviderType(),
	autoRpc: getInitialAutoRpc(),
}
