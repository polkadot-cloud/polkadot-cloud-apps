// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { REQUEST_TIMEOUT_MS } from './consts'
import type { GuestSession, MessagePage } from './types'

export class RequestError extends Error {
	constructor(readonly status: number) {
		super(`Chat request failed (${status})`)
	}
}

// Normalize once so REST, sockets and local credentials use the same origin.
export const getServiceOrigin = (endpoint: string): string => {
	const url = new URL(endpoint)
	if (
		!['http:', 'https:'].includes(url.protocol) ||
		url.username ||
		url.password ||
		url.pathname !== '/' ||
		url.search ||
		url.hash
	) {
		throw new Error('Chat requires an HTTP(S) service origin.')
	}
	return url.origin
}

const request = async <T>(
	origin: string,
	path: string,
	token: string,
	signal: AbortSignal,
	body?: object,
): Promise<T> => {
	signal.throwIfAborted()
	const response = await fetch(`${origin}${path}`, {
		method: body ? 'POST' : 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		credentials: 'omit',
		// Reconnecting aborts the entire history traversal; the timeout bounds each request.
		signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
	})
	if (!response.ok) {
		throw new RequestError(response.status)
	}
	return response.json()
}

// The guest key is exchanged for a short-lived token scoped to one conversation.
export const createGuestSession = (
	origin: string,
	key: string,
	signal: AbortSignal,
): Promise<GuestSession> => request(origin, '/guest/session', key, signal, {})

export const getMessagePage = (
	origin: string,
	session: GuestSession,
	signal: AbortSignal,
	before?: string,
): Promise<MessagePage> => {
	const cursor = before ? `?before=${encodeURIComponent(before)}` : ''
	return request(
		origin,
		`/conversations/${session.conversationId}/messages${cursor}`,
		session.token,
		signal,
	)
}
