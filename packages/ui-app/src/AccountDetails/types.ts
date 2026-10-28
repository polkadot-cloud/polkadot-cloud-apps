// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId } from 'types'

// Account and network for the explorer section, with an optional menu-close callback.
export interface AccountDetailsProps {
	address: string | null
	network: NetworkId
	onOpen?: () => void
}
