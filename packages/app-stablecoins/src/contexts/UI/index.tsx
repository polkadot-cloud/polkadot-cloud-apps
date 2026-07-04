// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import { localStorageOrDefault, setStateWithRef } from '@w3ux/utils'
import { PageWidthMediumThreshold } from 'consts'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

interface UIContextInterface {
	advancedMode: boolean
	setAdvancedMode: (value: boolean) => void
	setShowHelp: (value: boolean) => void
	setSideMenu: (value: boolean) => void
	setUserSideMenuMinimised: (value: boolean) => void
	showHelp: boolean
	sideMenuMinimised: boolean
	sideMenuOpen: boolean
	userSideMenuMinimised: boolean
}

export const [UIContext, useUi] = createSafeContext<UIContextInterface>()

export const UIProvider = ({ children }: { children: ReactNode }) => {
	const [sideMenuOpen, setSideMenu] = useState<boolean>(false)
	const [userSideMenuMinimised, setUserSideMenuMinimisedState] =
		useState<boolean>(
			localStorageOrDefault('side_menu_minimised', false, true) as boolean,
		)
	const userSideMenuMinimisedRef = useRef(userSideMenuMinimised)

	const setUserSideMenuMinimised = (value: boolean) => {
		localStorage.setItem('side_menu_minimised', String(value))
		setStateWithRef(
			value,
			setUserSideMenuMinimisedState,
			userSideMenuMinimisedRef,
		)
	}

	const [sideMenuMinimised, setSideMenuMinimised] = useState<boolean>(
		window.innerWidth <= PageWidthMediumThreshold
			? false
			: userSideMenuMinimisedRef.current,
	)

	const resizeCallback = () => {
		if (window.innerWidth <= PageWidthMediumThreshold) {
			setSideMenuMinimised(false)
		} else {
			setSideMenuMinimised(userSideMenuMinimisedRef.current)
		}
	}

	useEffect(() => {
		window.addEventListener('resize', resizeCallback)
		return () => {
			window.removeEventListener('resize', resizeCallback)
		}
	}, [])

	useEffectIgnoreInitial(() => {
		resizeCallback()
	}, [userSideMenuMinimised])

	return (
		<UIContext.Provider
			value={{
				advancedMode: false,
				setAdvancedMode: () => {},
				setShowHelp: () => {},
				setSideMenu,
				setUserSideMenuMinimised,
				showHelp: false,
				sideMenuMinimised,
				sideMenuOpen,
				userSideMenuMinimised,
			}}
		>
			{children}
		</UIContext.Provider>
	)
}
