// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode, RefObject } from 'react'
import { createSingletonStore, useSingletonStore } from '../util'
import type { MenuHookInterface, MenuMouseEvent } from './types'

export type { MenuHookInterface, MenuItem, MenuMouseEvent } from './types'

const DocumentPadding = 20

type MenuState = Pick<MenuHookInterface, 'open' | 'show' | 'inner' | 'position'>

const getInitialMenuState = (): MenuState => ({
	open: false,
	show: false,
	inner: null,
	position: [0, 0],
})

const menuStore = createSingletonStore<MenuState>(getInitialMenuState)

const openMenu = (ev: MenuMouseEvent, newInner?: ReactNode) => {
	if (menuStore.getSnapshot().open) {
		return
	}

	const bodyRect = document.body.getBoundingClientRect()
	const x = ev.clientX - bodyRect.left
	const y = ev.clientY - bodyRect.top

	menuStore.patchSnapshot({
		inner: newInner ?? menuStore.getSnapshot().inner,
		position: [x, y],
		open: true,
	})
}

const closeMenu = () => {
	menuStore.patchSnapshot({
		show: false,
		open: false,
	})
}

const setMenuInner = (newInner: ReactNode) => {
	menuStore.patchSnapshot({ inner: newInner })
}

const checkMenuPosition = (ref: RefObject<HTMLDivElement | null>) => {
	if (!ref.current) {
		return
	}

	const {
		position: [positionX, positionY],
	} = menuStore.getSnapshot()
	const bodyRect = document.body.getBoundingClientRect()
	const menuRect = ref.current.getBoundingClientRect()
	const hiddenRight = menuRect.right > bodyRect.right
	const hiddenBottom = menuRect.bottom > bodyRect.bottom

	const x = hiddenRight
		? window.innerWidth - menuRect.width - DocumentPadding
		: positionX

	const y = hiddenBottom
		? window.innerHeight - menuRect.height - DocumentPadding
		: positionY

	menuStore.patchSnapshot({
		position: [x, y],
		show: true,
	})
}

export const useMenu = (): MenuHookInterface => ({
	...useSingletonStore(menuStore),
	openMenu,
	closeMenu,
	setMenuInner,
	checkMenuPosition,
})
