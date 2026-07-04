// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FiatCurrencyKey } from 'consts'
import { getDefaultFiatCurrency, getUserFiatCurrency } from 'locales/util'
import { useCallback } from 'react'
import {
	createSingletonStore,
	type SingletonStore,
	useSingletonStore,
} from '../util'
import type { CurrencyHookInterface } from './types'
import { persistCurrency } from './util'

export type { CurrencyHookInterface } from './types'

let storageListenerAttached = false
let currencyStore: SingletonStore<string>

const getSafeUserFiatCurrency = () => {
	try {
		return getUserFiatCurrency()
	} catch {
		return getDefaultFiatCurrency()
	}
}

const handleStorageChange = (event: StorageEvent) => {
	if (event.key === FiatCurrencyKey) {
		currencyStore.setSnapshot(getSafeUserFiatCurrency())
	}
}

const attachStorageListener = () => {
	if (typeof window === 'undefined' || storageListenerAttached) {
		return
	}
	window.addEventListener('storage', handleStorageChange)
	storageListenerAttached = true
}

const detachStorageListener = () => {
	if (typeof window === 'undefined' || !storageListenerAttached) {
		return
	}
	window.removeEventListener('storage', handleStorageChange)
	storageListenerAttached = false
}

currencyStore = createSingletonStore(getSafeUserFiatCurrency, {
	onBeforeFirstSubscribe: () => {
		currencyStore.refreshSnapshot()
	},
	onFirstSubscribe: () => {
		attachStorageListener()
	},
	onLastUnsubscribe: detachStorageListener,
	serverSnapshot: getDefaultFiatCurrency,
})

const setCurrencyState = (currency: string) => {
	persistCurrency(currency)
	currencyStore.setSnapshot(currency)
}

export const useCurrency = (): CurrencyHookInterface => {
	const currency = useSingletonStore(currencyStore)

	const setCurrency = useCallback((currency: string) => {
		setCurrencyState(currency)
	}, [])

	return {
		currency,
		setCurrency,
	}
}
