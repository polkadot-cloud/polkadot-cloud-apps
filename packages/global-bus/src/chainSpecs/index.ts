// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainSpec } from 'types'
import { _chainSpecs } from './private'

export const chainSpecs$ = _chainSpecs.asObservable()

export const resetChainSpecs = () => {
	_chainSpecs.next({})
}

export const getChainSpec = (id: string) => _chainSpecs.getValue()[id]

export const setChainSpec = (id: string, spec: ChainSpec) => {
	_chainSpecs.next({
		..._chainSpecs.getValue(),
		[id]: spec,
	})
}

export const setMultiChainSpecs = (specs: Record<string, ChainSpec>) => {
	_chainSpecs.next({
		..._chainSpecs.getValue(),
		...specs,
	})
}

export * from './default'
