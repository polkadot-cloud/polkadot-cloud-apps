// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useTheme } from 'hooks'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

type ThemeValuesContextInterface = {
	getThemeValue: (name: string) => string
}

export const [ThemeValuesContext, useThemeValues] =
	createSafeContext<ThemeValuesContextInterface>()

export const ThemeValuesProvider = ({ children }: { children: ReactNode }) => {
	const { themeElementRef } = useTheme()
	const [classListString, setClassListString] = useState<string>('')

	useEffect(() => {
		if (!themeElementRef.current) {
			return
		}
		const observer = new MutationObserver(() => {
			if (!themeElementRef.current) {
				return
			}
			setClassListString(themeElementRef.current.classList.toString())
		})
		observer.observe(themeElementRef.current, {
			attributes: true,
			attributeFilter: ['class'],
		})
		return () => observer.disconnect()
	}, [])

	const getThemeValue = useCallback(
		(variable: string) => {
			if (!themeElementRef.current) {
				return ''
			}
			const style = getComputedStyle(themeElementRef.current)
			return style?.getPropertyValue(variable).trim()
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
