// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '../useTheme'
import type { ThemeValuesHookInterface } from './types'

export type { ThemeValuesHookInterface } from './types'

const getClassListString = (element: HTMLDivElement | null) =>
	element?.classList.toString() ?? ''

export const useThemeValues = (): ThemeValuesHookInterface => {
	const { mode, themeElementRef } = useTheme()
	const [classListString, setClassListString] = useState<string>(() =>
		getClassListString(themeElementRef.current),
	)

	useEffect(() => {
		const element = themeElementRef.current
		if (!element) {
			return
		}

		setClassListString(getClassListString(element))

		const observer = new MutationObserver(() => {
			setClassListString(getClassListString(element))
		})

		observer.observe(element, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [mode, themeElementRef])

	const getThemeValue = useCallback(
		(variable: string) => {
			const element = themeElementRef.current
			if (!element) {
				return ''
			}
			return getComputedStyle(element).getPropertyValue(variable).trim()
		},
		[classListString, themeElementRef],
	)

	return { getThemeValue }
}
