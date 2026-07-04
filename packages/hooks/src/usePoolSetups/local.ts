// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PoolSetupsKey } from 'consts'
import type { PoolSetups } from './types'

export const getLocalPoolSetups = (): PoolSetups => {
	if (typeof localStorage === 'undefined') {
		return {}
	}
	try {
		const localSetups = localStorage.getItem(PoolSetupsKey)
		const parsed = localSetups ? JSON.parse(localSetups) : {}
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? parsed
			: {}
	} catch {
		localStorage.removeItem(PoolSetupsKey)
		return {}
	}
}

export const setLocalPoolSetups = (setups: PoolSetups) => {
	if (typeof localStorage === 'undefined') {
		return
	}
	const setupsStr = JSON.stringify(setups)
	if (setupsStr === '{}') {
		localStorage.removeItem(PoolSetupsKey)
	} else {
		localStorage.setItem(PoolSetupsKey, setupsStr)
	}
}
