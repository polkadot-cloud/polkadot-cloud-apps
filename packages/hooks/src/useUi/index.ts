// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue, localStorageOrDefault } from '@w3ux/utils'
import { AdvancedModeKey, PageWidthMediumThreshold } from 'consts'
import {
	createSingletonStore,
	type SingletonStore,
	useSingletonStore,
} from '../util'
import type { UiHookInterface } from './types'

export type { UiHookInterface } from './types'

const SideMenuMinimisedKey = 'side_menu_minimised'
const defaultAdvancedMode = false

type UiState = Omit<
	UiHookInterface,
	| 'setSideMenu'
	| 'setUserSideMenuMinimised'
	| 'setContainerRefs'
	| 'setAdvancedMode'
>

const hasWindow = () => typeof window !== 'undefined'
const hasLocalStorage = () => typeof localStorage !== 'undefined'

const getInitialAdvancedMode = (): boolean => {
	if (!hasLocalStorage()) {
		return defaultAdvancedMode
	}
	try {
		const urlMode = hasWindow() ? extractUrlValue('m') : null
		const localOrDefault = localStorageOrDefault(
			AdvancedModeKey,
			defaultAdvancedMode,
			true,
		) as boolean

		if (urlMode && ['simple', 'advanced'].includes(urlMode)) {
			const isAdvancedMode = urlMode === 'advanced'
			localStorage.setItem(AdvancedModeKey, String(isAdvancedMode))
			return isAdvancedMode
		}
		return localOrDefault
	} catch {
		try {
			localStorage.setItem(AdvancedModeKey, String(defaultAdvancedMode))
		} catch {
			// ignore storage write errors (e.g. private mode / blocked storage)
		}
		return defaultAdvancedMode
	}
}

const getInitialUserSideMenuMinimised = (): boolean => {
	if (!hasLocalStorage()) {
		return false
	}
	try {
		return localStorageOrDefault(SideMenuMinimisedKey, false, true) as boolean
	} catch {
		return false
	}
}

const getResponsiveSideMenuMinimised = (userSideMenuMinimised: boolean) => {
	if (!hasWindow()) {
		return userSideMenuMinimised
	}
	return window.innerWidth <= PageWidthMediumThreshold
		? false
		: userSideMenuMinimised
}

const getInitialUiState = (): UiState => {
	const userSideMenuMinimised = getInitialUserSideMenuMinimised()
	return {
		sideMenuOpen: false,
		userSideMenuMinimised,
		sideMenuMinimised: getResponsiveSideMenuMinimised(userSideMenuMinimised),
		containerRefs: {},
		isBraveBrowser: false,
		advancedMode: getInitialAdvancedMode(),
	}
}

let resizeListenerAttached = false
let braveDetectionStarted = false
let uiStore: SingletonStore<UiState>

const resizeCallback = () => {
	uiStore.patchSnapshot({
		sideMenuMinimised: getResponsiveSideMenuMinimised(
			uiStore.getSnapshot().userSideMenuMinimised,
		),
	})
}

const detectBraveBrowser = () => {
	if (!hasWindow() || braveDetectionStarted) {
		return
	}
	braveDetectionStarted = true
	const maybeNavigator = window.navigator as Navigator & {
		brave?: { isBrave?: () => Promise<boolean> }
	}
	void maybeNavigator.brave
		?.isBrave?.()
		.then((isBrave) => {
			uiStore.patchSnapshot({ isBraveBrowser: isBrave })
		})
		.catch(() => {
			// ignore brave detection errors
		})
}

const attachUiListeners = () => {
	detectBraveBrowser()
	if (!hasWindow() || resizeListenerAttached) {
		return
	}
	window.addEventListener('resize', resizeCallback)
	resizeListenerAttached = true
}

const detachUiListeners = () => {
	if (!hasWindow() || !resizeListenerAttached) {
		return
	}
	window.removeEventListener('resize', resizeCallback)
	resizeListenerAttached = false
}

uiStore = createSingletonStore<UiState>(getInitialUiState, {
	onFirstSubscribe: attachUiListeners,
	onLastUnsubscribe: detachUiListeners,
})

const setSideMenu = (v: boolean) => {
	uiStore.patchSnapshot({ sideMenuOpen: v })
}

const setUserSideMenuMinimised = (v: boolean) => {
	if (hasLocalStorage()) {
		localStorage.setItem(SideMenuMinimisedKey, String(v))
	}
	uiStore.patchSnapshot({
		userSideMenuMinimised: v,
		sideMenuMinimised: getResponsiveSideMenuMinimised(v),
	})
}

export const setDefaultSideMenuMinimised = (v: boolean) => {
	if (hasLocalStorage()) {
		try {
			if (localStorage.getItem(SideMenuMinimisedKey) !== null) {
				return
			}
		} catch {
			// fall back to the app default when storage cannot be read
		}
	}

	uiStore.patchSnapshot({
		userSideMenuMinimised: v,
		sideMenuMinimised: getResponsiveSideMenuMinimised(v),
	})
}

const setContainerRefs = (v: UiState['containerRefs']) => {
	uiStore.patchSnapshot({ containerRefs: v })
}

const setAdvancedMode = (value: boolean) => {
	if (hasLocalStorage()) {
		localStorage.setItem(AdvancedModeKey, String(value))
	}
	uiStore.patchSnapshot({ advancedMode: value })
}

export const useUi = (): UiHookInterface => {
	const state = useSingletonStore(uiStore)

	return {
		...state,
		setSideMenu,
		setUserSideMenuMinimised,
		setContainerRefs,
		setAdvancedMode,
	}
}
