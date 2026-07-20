// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainConsts } from 'types'
import { _consts } from './private'

export const consts$ = _consts.asObservable()

export const resetConsts = () => {
	_consts.next({})
}

export const getConsts = (id: string) => _consts.getValue()[id]

export const setConsts = (id: string, consts: ChainConsts) => {
	_consts.next({
		..._consts.getValue(),
		[id]: consts,
	})
}

export const setMultiConsts = (consts: Record<string, ChainConsts>) => {
	_consts.next({
		..._consts.getValue(),
		...consts,
	})
}

export * from './default'
