// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault } from '@w3ux/utils'
import { ShowHelpKey } from 'consts'
import { createSingletonStore, useSingletonStore } from '../util'

const defaultShowHelp = true

export interface ShowHelpHookInterface {
	showHelp: boolean
	setShowHelp: (value: boolean) => void
}

const hasLocalStorage = () => typeof localStorage !== 'undefined'

const getInitialShowHelp = (): boolean => {
	if (!hasLocalStorage()) {
		return defaultShowHelp
	}
	try {
		return localStorageOrDefault(ShowHelpKey, defaultShowHelp, true) as boolean
	} catch {
		try {
			localStorage.setItem(ShowHelpKey, String(defaultShowHelp))
		} catch {
			// ignore storage write errors (e.g. private mode / blocked storage)
		}
		return defaultShowHelp
	}
}

const showHelpStore = createSingletonStore<boolean>(getInitialShowHelp)

const setShowHelp = (value: boolean) => {
	if (hasLocalStorage()) {
		localStorage.setItem(ShowHelpKey, String(value))
	}
	showHelpStore.setSnapshot(value)
}

export const useShowHelp = (): ShowHelpHookInterface => ({
	showHelp: useSingletonStore(showHelpStore),
	setShowHelp,
})
