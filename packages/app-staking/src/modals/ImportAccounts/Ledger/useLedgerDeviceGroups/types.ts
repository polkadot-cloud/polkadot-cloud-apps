// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HardwareAccount } from '@w3ux/types'
import type { Dispatch, RefObject, SetStateAction } from 'react'

export type GroupAnchor = { index: number; address: string }

export interface UseLedgerDeviceGroupsProps {
	addresses: HardwareAccount[]
	addressesRef: RefObject<HardwareAccount[]>
	setAddresses: Dispatch<SetStateAction<HardwareAccount[]>>
}
