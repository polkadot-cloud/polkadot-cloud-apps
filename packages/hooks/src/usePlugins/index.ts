// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DisabledPluginsPerNetwork } from 'consts/plugins'
import { getAvailablePlugins, plugins$, setPlugins } from 'global-bus'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { NetworkId, Plugin } from 'types'
import { createObservableStore } from 'utils'
import { useNetwork } from '../useNetwork'
import type { PluginsHookInterface } from './types'

export type { PluginsHookInterface } from './types'

const { activePlugins } = getAvailablePlugins()
const pluginsStore = createObservableStore<Plugin[]>(plugins$, activePlugins)

let lastSyncedNetwork: NetworkId | null = null

const syncPluginsForNetwork = (network: NetworkId) => {
	if (lastSyncedNetwork === network) {
		return
	}
	lastSyncedNetwork = network
	const { allPlugins, activePlugins } = getAvailablePlugins()
	setPlugins(allPlugins, activePlugins)
}

export const usePlugins = (): PluginsHookInterface => {
	const { network } = useNetwork()
	const plugins = useSyncExternalStore(
		pluginsStore.subscribe,
		pluginsStore.getSnapshot,
		pluginsStore.getSnapshot,
	)

	const togglePlugin = useCallback(
		(key: Plugin) => {
			const { allPlugins } = getAvailablePlugins()
			const nextAll = allPlugins.includes(key)
				? allPlugins.filter((p) => p !== key)
				: [...allPlugins, key]

			const disabledPlugins = new Set(DisabledPluginsPerNetwork[network] ?? [])
			const nextActive = nextAll.filter((p) => !disabledPlugins.has(p))

			setPlugins(nextAll, nextActive)
		},
		[network],
	)

	const pluginEnabled = useCallback(
		(key: Plugin) => plugins.includes(key),
		[plugins],
	)

	useEffect(() => {
		syncPluginsForNetwork(network)
	}, [network])

	return {
		togglePlugin,
		pluginEnabled,
		plugins,
	}
}
