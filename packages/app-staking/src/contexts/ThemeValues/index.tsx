// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useTheme } from 'contexts/Themes'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ThemeValuesContextInterface } from './types'

export const [ThemeValuesContext, useThemeValues] =
	createSafeContext<ThemeValuesContextInterface>()

export const ThemeValuesProvider = ({ children }: { children: ReactNode }) => {
	const { themeElementRef } = useTheme()

	// Store the class list of the theme container as a string
	const [classListString, setClassListString] = useState<string>('')

	// Watch for classList changes using MutationObserver
	useEffect(() => {
		if (!themeElementRef.current) {
			return
		}
		const observer = new MutationObserver(() => {
			if (!themeElementRef.current) {
				return
			}
			// Store classList as a string
			setClassListString(themeElementRef.current.classList.toString())
		})
		observer.observe(themeElementRef.current, {
			attributes: true,
			attributeFilter: ['class'], // Only watch class changes
		})
		return () => observer.disconnect()
	}, [])

	// Get a CSS variable value from theme container
	const getThemeValue = useCallback(
		(variable: string) => {
			if (!themeElementRef.current) {
				return ''
			}
			const style = getComputedStyle(themeElementRef.current)
			const value = style?.getPropertyValue(variable).trim()
			return value
		},
		[classListString],
	)

	return (
		<ThemeValuesContext.Provider
			value={{
				getThemeValue,
			}}
		>
			{children}
		</ThemeValuesContext.Provider>
	)
}
