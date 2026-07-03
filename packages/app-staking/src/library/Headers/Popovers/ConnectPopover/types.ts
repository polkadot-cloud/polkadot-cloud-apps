// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtensionArrayListItem } from '@w3ux/extension-assets/util'
import type { Dispatch, SetStateAction } from 'react'

export type WalletProps = SetOpenProp & {
	installed: ExtensionArrayListItem[]
	other: ExtensionArrayListItem[]
	selectedSection: string
}

export type ExtensionProps = SetOpenProp & {
	extension: ExtensionArrayListItem
	last: boolean
}

export interface SetOpenProp {
	setOpen: Dispatch<SetStateAction<boolean>>
}
