// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ComponentBase } from 'types'

export type ItemProps = ComponentBase & {
	address: string
	initial: string
	disableEditIfImported?: boolean
	allowAction?: boolean
	Identicon: ReactNode
	renameHandler: (address: string, newName: string) => void
	existsHandler: (address: string) => boolean
	onRemove: (address: string) => void
	last?: boolean
}
