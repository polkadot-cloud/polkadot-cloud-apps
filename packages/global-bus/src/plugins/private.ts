// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { Plugin } from 'types'
import { getAvailablePlugins } from './local'

const { activePlugins } = getAvailablePlugins()
export const _plugins = new BehaviorSubject<Plugin[]>(activePlugins)
