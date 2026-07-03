// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HTMLMotionProps } from 'motion/react'
import type { ComponentBase } from 'types'

export type BaseWithAnimation = ComponentBase & HTMLMotionProps<'div'>

export type CardProps = ComponentBase & {
	dimmed?: boolean
}
export type ContentProps = BaseWithAnimation & {
	canvas?: boolean
}

export type FixedTitleProps = ComponentBase & {
	withStyle?: boolean
}

export type NotesProps = ComponentBase & {
	withPadding?: boolean
}

export type PaddingProps = ComponentBase & {
	verticalOnly?: boolean
	horizontalOnly?: boolean
}

export type ScrollProps = ComponentBase & {
	size: string
	overflow: string
}

export type SectionProps = ComponentBase & {
	type: 'tab' | 'carousel'
}

export type ContainerProps = BaseWithAnimation & {
	onClose: () => void
}

export interface RoleChangeProps {
	roleName: string
	oldAddress?: string
	newAddress?: string
}
