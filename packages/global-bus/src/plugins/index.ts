// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
	localStorage.setItem('plugins', JSON.stringify(allPlugins))
	_plugins.next(allPlugins)
}

export const pluginEnabled = (key: Plugin) => getPlugins().includes(key)

export * from './local'
