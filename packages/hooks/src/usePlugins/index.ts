// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getAvailablePlugins,
	getPlugins,
	plugins$,
	setPlugins,
} from 'global-bus'
import { useCallback, useSyncExternalStore } from 'react'
import type { Plugin } from 'types'
import { createObservableStore } from 'utils'
import type { PluginsHookInterface } from './types'

export type { PluginsHookInterface } from './types'

const pluginsStore = createObservableStore<Plugin[]>(plugins$, getPlugins)

export const usePlugins = (): PluginsHookInterface => {
	const plugins = useSyncExternalStore(
		pluginsStore.subscribe,
		pluginsStore.getSnapshot,
		pluginsStore.getSnapshot,
	)

	const togglePlugin = useCallback((key: Plugin) => {
		const { allPlugins } = getAvailablePlugins()
		const nextAll = allPlugins.includes(key)
			? allPlugins.filter((p) => p !== key)
			: [...allPlugins, key]

		setPlugins(nextAll)
	}, [])

	const pluginEnabled = useCallback(
		(key: Plugin) => plugins.includes(key),
		[plugins],
	)

	return {
		togglePlugin,
		pluginEnabled,
		plugins,
	}
}
