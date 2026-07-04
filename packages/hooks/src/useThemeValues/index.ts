// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback } from 'react'
import { getThemeElement } from '../useTheme'
import {
	createSingletonStore,
	type SingletonStore,
	useSingletonStore,
} from '../util'
import type { ThemeValuesHookInterface } from './types'

export type { ThemeValuesHookInterface } from './types'

const getClassListString = (element: HTMLDivElement | null) =>
	element?.classList.toString() ?? ''

const getThemeClassListString = () => getClassListString(getThemeElement())

let themeValuesStore: SingletonStore<string>
let observer: MutationObserver | undefined
let observedElement: HTMLDivElement | null = null
let retryAnimationFrame: number | undefined

const hasWindow = () => typeof window !== 'undefined'
const hasMutationObserver = () => typeof MutationObserver !== 'undefined'

const setClassListSnapshot = () => {
	const nextClassList = getThemeClassListString()
	if (themeValuesStore.getSnapshot() !== nextClassList) {
		themeValuesStore.setSnapshot(nextClassList)
	}
}

const cancelObserverRetry = () => {
	if (retryAnimationFrame === undefined || !hasWindow()) {
		return
	}
	window.cancelAnimationFrame(retryAnimationFrame)
	retryAnimationFrame = undefined
}

const scheduleObserverRetry = () => {
	if (!hasWindow() || retryAnimationFrame !== undefined) {
		return
	}
	retryAnimationFrame = window.requestAnimationFrame(() => {
		retryAnimationFrame = undefined
		if (themeValuesStore.getListenerCount() > 0) {
			attachThemeValuesObserver()
		}
	})
}

const disconnectThemeValuesObserver = () => {
	cancelObserverRetry()
	observer?.disconnect()
	observer = undefined
	observedElement = null
}

const attachThemeValuesObserver = () => {
	setClassListSnapshot()

	if (!hasMutationObserver()) {
		return
	}

	const element = getThemeElement()
	if (!element) {
		scheduleObserverRetry()
		return
	}

	if (observer && observedElement === element) {
		return
	}

	disconnectThemeValuesObserver()
	observedElement = element
	observer = new MutationObserver(setClassListSnapshot)
	observer.observe(element, {
		attributes: true,
		attributeFilter: ['class'],
	})
}

themeValuesStore = createSingletonStore<string>(getThemeClassListString, {
	onBeforeFirstSubscribe: () => {
		themeValuesStore.refreshSnapshot()
	},
	onFirstSubscribe: attachThemeValuesObserver,
	onLastUnsubscribe: disconnectThemeValuesObserver,
	serverSnapshot: '',
})

export const useThemeValues = (): ThemeValuesHookInterface => {
	const classListString = useSingletonStore(themeValuesStore)
	const getThemeValue = useCallback(
		(variable: string) => {
			const element = getThemeElement()
			if (!element) {
				return ''
			}
			return getComputedStyle(element).getPropertyValue(variable).trim()
		},
		[classListString],
	)

	return { getThemeValue }
}
