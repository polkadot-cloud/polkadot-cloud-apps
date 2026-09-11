// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PluginsList } from 'consts/plugins'
import { combineLatest, map } from 'rxjs'
import type { Plugin } from 'types'
import { networkConfig$ } from '../networkConfig'
import { getActivePlugins } from './local'
import { _plugins } from './private'

export const getPlugins = () => getActivePlugins(_plugins.getValue())

// Derive enabled plugins whenever preferences or the global network change.
export const plugins$ = combineLatest([_plugins, networkConfig$]).pipe(
	map(getPlugins),
)

export const setPlugins = (allPlugins: Plugin[]) => {
	const supportedPlugins = allPlugins.filter((plugin) =>
		PluginsList.includes(plugin),
	)
	localStorage.setItem('plugins', JSON.stringify(supportedPlugins))
	_plugins.next(supportedPlugins)
}

export const pluginEnabled = (key: Plugin) => getPlugins().includes(key)

export * from './local'
