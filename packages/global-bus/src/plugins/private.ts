// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BehaviorSubject } from 'rxjs'
import type { Plugin } from 'types'
import { getAvailablePlugins } from './local'

// Store preferences so switching networks can restore temporarily disabled plugins.
const { allPlugins } = getAvailablePlugins()
export const _plugins = new BehaviorSubject<Plugin[]>(allPlugins)
