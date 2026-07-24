// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveEra } from 'types'
import { defaultActiveEra } from './default'
import { _activeEra } from './private'

export const activeEra$ = _activeEra.asObservable()

export const resetActiveEra = () => {
	_activeEra.next(defaultActiveEra)
}

export const getActiveEra = () => _activeEra.getValue()

export const setActiveEra = (activeEra: ActiveEra) => {
	_activeEra.next(activeEra)
}

export * from './default'
