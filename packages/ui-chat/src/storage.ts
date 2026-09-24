// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MAX_MESSAGE_LENGTH } from './consts'
import type { GuestIdentity, MessageInput } from './types'

// Keep credentials isolated between local, staging and production services.
export const storageKey = (origin: string) =>
	`cloud:guest-chat:polkadot:${origin}`

const isMessageInput = (value: unknown): value is MessageInput =>
	typeof value === 'object' &&
	value !== null &&
	'requestId' in value &&
	typeof value.requestId === 'string' &&
	/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
		value.requestId,
	) &&
	'body' in value &&
	typeof value.body === 'string' &&
	value.body.trim().length > 0 &&
	value.body.length <= MAX_MESSAGE_LENGTH

export const readIdentity = (origin: string): GuestIdentity | null => {
	try {
		const value: unknown = JSON.parse(
			localStorage.getItem(storageKey(origin)) || 'null',
		)
		if (
			typeof value !== 'object' ||
			value === null ||
			!('key' in value) ||
			typeof value.key !== 'string' ||
			!/^[A-Za-z0-9_-]{43}$/.test(value.key)
		) {
			return null
		}

		// Discard invalid pending data without losing an otherwise valid guest key.
		const pending = 'pending' in value ? value.pending : null
		return {
			key: value.key,
			pending: isMessageInput(pending) ? pending : null,
		}
	} catch {
		return null
	}
}

// Encode 256 random bits as an unpadded base64url bearer credential.
export const newIdentity = (): GuestIdentity => {
	const bytes = crypto.getRandomValues(new Uint8Array(32))
	return {
		key: btoa(String.fromCharCode(...bytes))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, ''),
		pending: null,
	}
}

export const saveIdentity = (
	origin: string,
	identity: GuestIdentity,
): boolean => {
	try {
		localStorage.setItem(storageKey(origin), JSON.stringify(identity))
		return true
	} catch {
		// Storage restrictions leave the client usable for the current page only.
		return false
	}
}
