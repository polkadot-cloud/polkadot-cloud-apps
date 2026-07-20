// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Plugin } from 'types'

export interface PluginsHookInterface {
	togglePlugin: (key: Plugin) => void
	pluginEnabled: (key: Plugin) => boolean
	plugins: Plugin[]
}
