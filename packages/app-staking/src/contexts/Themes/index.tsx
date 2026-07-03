// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { setStateWithRef } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Theme, ThemeContextInterface } from './types'

export const [ThemeContext, useTheme] =
	createSafeContext<ThemeContextInterface>()

export const ThemesProvider = ({ children }: { children: ReactNode }) => {
	let initialTheme: Theme = 'light'

	// get the current theme
	const localThemeRaw = localStorage.getItem('theme') || ''

	// Provide system theme if raw theme is not valid
	if (!['light', 'dark'].includes(localThemeRaw)) {
		const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)')
			.matches
			? 'dark'
			: 'light'

		initialTheme = systemTheme
		localStorage.setItem('theme', systemTheme)
	} else {
		// `localThemeRaw` is a valid theme
		initialTheme = localThemeRaw as Theme
	}

	// The current theme mode
	const [theme, setTheme] = useState<Theme>(initialTheme)
	const themeRef = useRef(theme)

	// Automatically change theme on system change
	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = (event: MediaQueryListEvent) => {
			const newTheme = event.matches ? 'dark' : 'light'
			localStorage.setItem('theme', newTheme)
			setStateWithRef(newTheme, setTheme, themeRef)
		}
		media.addEventListener('change', handler)
		return () => media.removeEventListener('change', handler)
	}, [])

	const toggleTheme = (maybeTheme: Theme | null = null): void => {
		const newTheme =
			maybeTheme || (themeRef.current === 'dark' ? 'light' : 'dark')

		localStorage.setItem('theme', newTheme)
		setStateWithRef(newTheme, setTheme, themeRef)
	}

	// A ref to refer to the Entry component that stores the theme variables.
	const themeElementRef = useRef<HTMLDivElement>(null)

	return (
		<ThemeContext.Provider
			value={{
				toggleTheme,
				themeElementRef,
				mode: themeRef.current,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
