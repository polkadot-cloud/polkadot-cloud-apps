// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LocalInviteConfig } from './types'

// biome-ignore lint/suspicious/noExplicitAny: Validate untyped local storage data.
export const isLocalInviteValid = (raw: any): raw is LocalInviteConfig => {
	try {
		if (
			!raw ||
			typeof raw !== 'object' ||
			typeof raw.network !== 'string' ||
			typeof raw.invite !== 'object' ||
			typeof raw.acknowledged !== 'boolean'
		) {
			return false
		}

		const { poolId } = raw.invite
		return typeof poolId === 'number' && !isNaN(poolId)
	} catch {
		return false
	}
}
