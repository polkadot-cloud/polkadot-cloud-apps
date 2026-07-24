// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LocalInviteConfig } from './types'
import { isLocalInviteValid } from './util'

const InviteKey = 'invite'

export const removeLocalInviteConfig = () => {
	if (typeof localStorage === 'undefined') {
		return
	}
	localStorage.removeItem(InviteKey)
}

export const getLocalInviteConfig = (): LocalInviteConfig | undefined => {
	if (typeof localStorage === 'undefined') {
		return undefined
	}
	try {
		const raw = localStorage.getItem(InviteKey)
		const result = raw ? JSON.parse(raw) : undefined
		if (isLocalInviteValid(result)) {
			return result
		}
		throw new Error()
	} catch {
		removeLocalInviteConfig()
		return undefined
	}
}

export const setLocalInviteConfig = (inviteConfig: LocalInviteConfig) => {
	if (typeof localStorage === 'undefined') {
		return
	}
	localStorage.setItem(InviteKey, JSON.stringify(inviteConfig))
}

export const acknowledgeLocalInvite = (acknowledged: boolean) => {
	const current = getLocalInviteConfig()
	if (current) {
		setLocalInviteConfig({
			...current,
			acknowledged,
		})
	}
}
