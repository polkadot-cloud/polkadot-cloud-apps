// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'

export type RowProps = ComponentBase & {
	yMargin?: boolean
	xMargin?: boolean
}

export type TooltipAreaProps = ComponentBase & {
	text: string
	pointer?: boolean
	onMouseMove: () => void
	onClick?: () => void
}

export type IdentityProps = ComponentBase & {
	address: string
	iconSize?: string | number
	Action?: React.ReactNode
	label: string
	value: string
}
