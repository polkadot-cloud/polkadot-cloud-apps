// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { _onlineStatus } from './private'

export const onlineStatus$ = _onlineStatus.asObservable()

export const listenOnlineStatus = () => {
	window.addEventListener('offline', async () => {
		setOnlineStatus(false)
	})
	window.addEventListener('online', () => {
		setOnlineStatus(true)
	})
}

export const getOnlineStatus = () => _onlineStatus.getValue()

export const setOnlineStatus = (online: boolean) => {
	_onlineStatus.next({
		online,
	})
}

export * from './default'
