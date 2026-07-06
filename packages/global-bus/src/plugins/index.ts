// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Plugin } from 'types'
import { _plugins } from './private'

export const plugins$ = _plugins.asObservable()

export const setPlugins = (allPlugins: Plugin[], activePlugins: Plugin[]) => {
	localStorage.setItem('plugins', JSON.stringify(allPlugins))
	_plugins.next(activePlugins)
}

export const pluginEnabled = (key: Plugin) => _plugins.getValue().includes(key)

export * from './local'
