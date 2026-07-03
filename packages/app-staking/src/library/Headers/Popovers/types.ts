// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, SetStateAction } from 'react'

export interface ToggleConnectProps {
	openConnect: boolean
	setOpenConnect: Dispatch<SetStateAction<boolean>>
}
