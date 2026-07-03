// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react'

export interface MenuContextInterface {
	open: boolean
	show: boolean
	inner: ReactNode | null
	position: [number, number]
	openMenu: (ev: MenuMouseEvent, newInner?: ReactNode) => void
	closeMenu: () => void
	setMenuInner: (items: ReactNode) => void
	checkMenuPosition: (ref: RefObject<HTMLDivElement | null>) => void
}

export interface MenuItem {
	icon: ReactNode
	title: string
	cb: () => void
	disabled?: boolean
}

export type MenuMouseEvent =
	| MouseEvent
	| ReactMouseEvent<HTMLButtonElement, MouseEvent>
