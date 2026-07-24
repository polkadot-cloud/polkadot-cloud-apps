// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface } from 'types'
import { defaultServiceInterface } from './default'
import { _serviceInterface } from './private'

export const serviceInterface$ = _serviceInterface.asObservable()

export const resetServiceInterface = () => {
	_serviceInterface.next(defaultServiceInterface)
}

export const setServiceInterface = (serviceInterface: ServiceInterface) => {
	_serviceInterface.next(serviceInterface)
}

export * from './default'
