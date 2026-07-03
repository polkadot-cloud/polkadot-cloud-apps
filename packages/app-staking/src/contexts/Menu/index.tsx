// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import type { ReactNode, RefObject } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { MenuContextInterface, MenuMouseEvent } from './types'

// Padding from the window edge (module-level constant — no need to recreate each render).
const DocumentPadding = 20

export const [MenuContext, useMenu] = createSafeContext<MenuContextInterface>()

export const MenuProvider = ({ children }: { children: ReactNode }) => {
	// Whether the menu is currently open. This initiates menu state but does not reflect whether the
	// menu is being displayed
	const [open, setOpen] = useState<boolean>(false)

	// Whether the menu is currently showing
	const [show, setShow] = useState<boolean>(false)

	// The components to be displayed in the menu
	const [inner, setInner] = useState<ReactNode>(null)

	// The menu position coordinates
	const [position, setPosition] = useState<[number, number]>([0, 0])

	// Sets the menu position and opens it. Only succeeds if the menu has been instantiated and is not
	// currently open. Re-creates only when `open` changes (at most once per open/close cycle).
	const openMenu = useCallback(
		(ev: MenuMouseEvent, newInner?: ReactNode) => {
			if (open) {
				return
			}
			const bodyRect = document.body.getBoundingClientRect()
			const x = ev.clientX - bodyRect.left
			const y = ev.clientY - bodyRect.top

			if (newInner) {
				setInner(newInner)
			}

			setPosition([x, y])
			setOpen(true)
		},
		[open],
	)

	// Stable — only calls setters with no state reads.
	const closeMenu = useCallback(() => {
		setShow(false)
		setOpen(false)
	}, [])

	// Stable — only calls setter with no state reads.
	const setMenuInner = useCallback((newInner: ReactNode) => {
		setInner(newInner)
	}, [])

	// Re-creates only when `position` changes (i.e. when the menu moves).
	const checkMenuPosition = useCallback(
		(ref: RefObject<HTMLDivElement | null>) => {
			if (!ref.current) {
				return
			}

			// Adjust menu position if it is leaking out of the window, otherwise keep it at the current
			// position
			const bodyRect = document.body.getBoundingClientRect()
			const menuRect = ref.current.getBoundingClientRect()
			const hiddenRight = menuRect.right > bodyRect.right
			const hiddenBottom = menuRect.bottom > bodyRect.bottom

			const x = hiddenRight
				? window.innerWidth - menuRect.width - DocumentPadding
				: position[0]

			const y = hiddenBottom
				? window.innerHeight - menuRect.height - DocumentPadding
				: position[1]

			setPosition([x, y])
			setShow(true)
		},
		[position],
	)

	const value = useMemo(
		() => ({
			open,
			show,
			inner,
			position,
			closeMenu,
			openMenu,
			setMenuInner,
			checkMenuPosition,
		}),
		[
			open,
			show,
			inner,
			position,
			closeMenu,
			openMenu,
			setMenuInner,
			checkMenuPosition,
		],
	)

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}
