// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { onlineStatus$ } from 'global-bus'
import { fetchTokenPrice, formatTokenPrice } from 'plugin-staking-api'
import { useEffect } from 'react'
import type { NetworkId } from 'types'
import { useCurrency } from '../useCurrency'
import { useNetwork } from '../useNetwork'
import { usePlugins } from '../usePlugins'
import {
	createSingletonStore,
	type SingletonStore,
	useSingletonStore,
} from '../util'
import { defaultTokenPrice } from './defaults'
import type { TokenPricesHookInterface } from './types'

export { defaultTokenPrice } from './defaults'
export type { TokenPricesHookInterface } from './types'

const REFETCH_PRICE_INTERVAL = 30_000
export const IGNORE_NETWORKS = ['westend']

type TokenPricesConfig = {
	network: NetworkId
	currency: string
	enabled: boolean
}

let currentConfig: TokenPricesConfig | null = null
let interval: ReturnType<typeof setInterval> | null = null
let onlineSubscription: { unsubscribe(): void } | null = null
let tokenPriceStore: SingletonStore<TokenPricesHookInterface>

const setCurrentPrice = (price: TokenPricesHookInterface) => {
	tokenPriceStore.setSnapshot(price)
}

const stopTokenPrices = () => {
	if (interval) {
		clearInterval(interval)
		interval = null
	}
	onlineSubscription?.unsubscribe()
	onlineSubscription = null
}

const fetchCurrentTokenPrice = async () => {
	const config = currentConfig
	if (!config) {
		return
	}
	const { network, currency, enabled } = config
	if (!enabled || IGNORE_NETWORKS.includes(network)) {
		// Prevent stale calls from overwriting state after a config change.
		if (currentConfig === config) {
			setCurrentPrice(defaultTokenPrice)
		}
		return
	}

	const { unit } = getStakingChainData(network)
	const { tokenPrice } = await fetchTokenPrice(
		`${unit}${currency}${currency === 'USD' ? 'T' : ''}`,
	)

	// Avoid applying results for a stale network/currency config.
	if (currentConfig !== config) {
		return
	}

	setCurrentPrice(
		tokenPrice
			? formatTokenPrice(tokenPrice.price, tokenPrice.change)
			: defaultTokenPrice,
	)
}

const startTokenPrices = () => {
	if (!currentConfig || tokenPriceStore.getListenerCount() === 0) {
		return
	}
	stopTokenPrices()
	if (
		!currentConfig.enabled ||
		IGNORE_NETWORKS.includes(currentConfig.network)
	) {
		setCurrentPrice(defaultTokenPrice)
		return
	}

	void fetchCurrentTokenPrice()
	interval = setInterval(fetchCurrentTokenPrice, REFETCH_PRICE_INTERVAL)
	onlineSubscription = onlineStatus$.subscribe((result) => {
		if (result.online) {
			void fetchCurrentTokenPrice()
		}
	})
}

const configsEqual = (
	a: TokenPricesConfig | null,
	b: TokenPricesConfig,
): boolean =>
	!!a &&
	a.network === b.network &&
	a.currency === b.currency &&
	a.enabled === b.enabled

const configureTokenPrices = (config: TokenPricesConfig) => {
	if (configsEqual(currentConfig, config)) {
		return
	}
	currentConfig = config
	startTokenPrices()
}

tokenPriceStore = createSingletonStore<TokenPricesHookInterface>(
	defaultTokenPrice,
	{
		onFirstSubscribe: startTokenPrices,
		onLastUnsubscribe: stopTokenPrices,
		serverSnapshot: defaultTokenPrice,
	},
)

export const useTokenPrices = (): TokenPricesHookInterface => {
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { pluginEnabled } = usePlugins()
	const enabled = pluginEnabled('staking_api')
	const tokenPrice = useSingletonStore(tokenPriceStore)

	useEffect(() => {
		configureTokenPrices({ network, currency, enabled })
	}, [network, currency, enabled])

	return tokenPrice
}
