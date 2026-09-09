// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault } from '@w3ux/utils'
import {
	CompulsoryPluginsProduction,
	DisabledPluginsPerNetwork,
	PluginsList,
} from 'consts/plugins'
import type { Plugin } from 'types'
import { getNetwork } from '../networkConfig'

const isProd =
	(import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD === true

// Apply network restrictions without changing the user's saved preferences.
export const getActivePlugins = (allPlugins: Plugin[]) => {
	const disabled = DisabledPluginsPerNetwork[getNetwork()] ?? []
	return allPlugins.filter((plugin) => !disabled.includes(plugin))
}

// Get initial plugins from local storage
export const getAvailablePlugins = () => {
	const allPlugins = localStorageOrDefault(
		'plugins',
		PluginsList,
		true,
	) as Plugin[]
	// In production, add compulsory plugins to `localPlugins` if they do not exist
	if (isProd) {
		CompulsoryPluginsProduction.forEach((plugin) => {
			if (!allPlugins.includes(plugin)) {
				allPlugins.push(plugin)
			}
		})
	}

	return { allPlugins, activePlugins: getActivePlugins(allPlugins) }
}
