// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { setStateWithRef } from '@w3ux/utils'
import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextInterface = {
	toggleTheme: (theme?: Theme | null) => void
	themeElementRef: RefObject<HTMLDivElement | null>
	mode: Theme
}

export const [ThemeContext, useTheme] =
	createSafeContext<ThemeContextInterface>()

export const ThemesProvider = ({ children }: { children: ReactNode }) => {
	let initialTheme: Theme = 'light'

	const localThemeRaw = localStorage.getItem('theme') || ''

	if (!['light', 'dark'].includes(localThemeRaw)) {
		const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)')
			.matches
			? 'dark'
			: 'light'

		initialTheme = systemTheme
		localStorage.setItem('theme', systemTheme)
	} else {
		initialTheme = localThemeRaw as Theme
	}

	const [theme, setTheme] = useState<Theme>(initialTheme)
	const themeRef = useRef(theme)
	const themeElementRef = useRef<HTMLDivElement>(null)

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

	return (
		<ThemeContext.Provider
			value={{
				mode: themeRef.current,
				themeElementRef,
				toggleTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
