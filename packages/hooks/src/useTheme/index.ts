// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createRef, useCallback } from 'react'
import {
	createSingletonStore,
	type SingletonStore,
	useSingletonStore,
} from '../util'
import type { Theme, ThemeHookInterface } from './types'

const ThemeStorageKey = 'theme'
const defaultTheme: Theme = 'light'

const themeElementRef = createRef<HTMLDivElement>()

export const getThemeElement = () => themeElementRef.current

let mediaListenerAttached = false
let storageListenerAttached = false
let themeStore: SingletonStore<Theme>

const hasWindow = () => typeof window !== 'undefined'
const hasLocalStorage = () => typeof localStorage !== 'undefined'

const isTheme = (value: string | null): value is Theme =>
	value === 'light' || value === 'dark'

const getSystemTheme = (): Theme =>
	hasWindow() && window.matchMedia?.('(prefers-color-scheme: dark)').matches
		? 'dark'
		: defaultTheme

const persistTheme = (theme: Theme) => {
	if (!hasLocalStorage()) {
		return
	}
	try {
		localStorage.setItem(ThemeStorageKey, theme)
	} catch {
		// ignore storage write errors
	}
}

const getInitialTheme = (): Theme => {
	if (!hasLocalStorage()) {
		return getSystemTheme()
	}

	try {
		const storedTheme = localStorage.getItem(ThemeStorageKey)
		if (isTheme(storedTheme)) {
			return storedTheme
		}
	} catch {
		return getSystemTheme()
	}

	const systemTheme = getSystemTheme()
	persistTheme(systemTheme)
	return systemTheme
}

const setThemeState = (theme: Theme) => {
	persistTheme(theme)
	themeStore.setSnapshot(theme)
}

let colorSchemeMedia: MediaQueryList | undefined

const getColorSchemeMedia = () => {
	if (!hasWindow()) {
		return undefined
	}
	colorSchemeMedia ??= window.matchMedia?.('(prefers-color-scheme: dark)')
	return colorSchemeMedia
}
const handleColorSchemeChange = (event: MediaQueryListEvent) => {
	setThemeState(event.matches ? 'dark' : 'light')
}

const handleStorageChange = (event: StorageEvent) => {
	if (event.key === ThemeStorageKey && isTheme(event.newValue)) {
		themeStore.setSnapshot(event.newValue)
	}
}

const attachThemeListeners = () => {
	const media = getColorSchemeMedia()
	if (media && !mediaListenerAttached) {
		media.addEventListener('change', handleColorSchemeChange)
		mediaListenerAttached = true
	}

	if (hasWindow() && !storageListenerAttached) {
		window.addEventListener('storage', handleStorageChange)
		storageListenerAttached = true
	}
}

const detachThemeListeners = () => {
	const media = getColorSchemeMedia()
	if (media && mediaListenerAttached) {
		media.removeEventListener('change', handleColorSchemeChange)
		mediaListenerAttached = false
	}

	if (hasWindow() && storageListenerAttached) {
		window.removeEventListener('storage', handleStorageChange)
		storageListenerAttached = false
	}
}

themeStore = createSingletonStore<Theme>(getInitialTheme, {
	onBeforeFirstSubscribe: () => {
		themeStore.refreshSnapshot()
	},
	onFirstSubscribe: attachThemeListeners,
	onLastUnsubscribe: detachThemeListeners,
	serverSnapshot: defaultTheme,
})

const toggleThemeState = (maybeTheme: Theme | null = null) => {
	const newTheme =
		maybeTheme || (themeStore.getSnapshot() === 'dark' ? 'light' : 'dark')

	setThemeState(newTheme)
}

export const useTheme = (): ThemeHookInterface => {
	const mode = useSingletonStore(themeStore)

	const toggleTheme = useCallback((maybeTheme: Theme | null = null) => {
		toggleThemeState(maybeTheme)
	}, [])

	return {
		themeElementRef,
		toggleTheme,
		mode,
	}
}
