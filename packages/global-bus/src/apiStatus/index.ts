// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ApiStatus } from 'types'
import { _apiStatus } from './private'

export const apiStatus$ = _apiStatus.asObservable()

export const resetApiStatus = () => {
	_apiStatus.next({})
}

export const getApiStatus = (id: string) =>
	_apiStatus.getValue()[id] || 'disconnected'

export const setApiStatus = (id: string, status: ApiStatus) => {
	_apiStatus.next({
		..._apiStatus.getValue(),
		[id]: status,
	})
}

export const setMultiApiStatus = (status: Record<string, ApiStatus>) => {
	_apiStatus.next({
		..._apiStatus.getValue(),
		...status,
	})
}
