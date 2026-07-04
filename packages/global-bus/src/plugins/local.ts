// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault } from '@w3ux/utils'
import { NetworkKey } from 'consts'
import { DefaultNetwork } from 'consts/networks'
import {
	CompulsoryPluginsProduction,
	DisabledPluginsPerNetwork,
	PluginsList,
} from 'consts/plugins'
import { isValidNetwork } from 'consts/util/networks'
import type { NetworkId, Plugin } from 'types'

const isProd =
	(import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD === true

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

	const rawLocalNetwork = localStorage.getItem(NetworkKey)
	const localNetwork =
		rawLocalNetwork && isValidNetwork(rawLocalNetwork as NetworkId)
			? (rawLocalNetwork as NetworkId)
			: DefaultNetwork

	const networkDisabledPlugins = DisabledPluginsPerNetwork[localNetwork] || []

	// Filter out disabled plugins for this network
	let activePlugins: Plugin[] = [...allPlugins]
	activePlugins = activePlugins.filter(
		(plugin) => !networkDisabledPlugins.includes(plugin),
	)

	return { allPlugins, activePlugins }
}
