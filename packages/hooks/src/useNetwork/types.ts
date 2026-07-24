// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId } from 'types'

export interface NetworkHookInterface {
	network: NetworkId
	switchNetwork: (network: NetworkId) => Promise<void>
}
