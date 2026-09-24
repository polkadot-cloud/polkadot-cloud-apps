// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ChatClient } from '../../ui-chat/src/client'
import { catchUpMessages, mergeMessages } from '../../ui-chat/src/history'
import {
	newIdentity,
	readIdentity,
	saveIdentity,
} from '../../ui-chat/src/storage'
import type { ChatMessage, MessageInput } from '../../ui-chat/src/types'

const { sockets, connectSocket } = vi.hoisted(() => {
	const sockets: Array<{
		connected: boolean
		handlers: Map<string, (value?: unknown) => void>
		on: (name: string, callback: (value?: unknown) => void) => void
		connect: () => void
		disconnect: () => void
		removeAllListeners: () => void
		timeout: () => { emitWithAck: ReturnType<typeof vi.fn> }
		emitWithAck: ReturnType<typeof vi.fn>
	}> = []
	const connectSocket = vi.fn(() => {
		const handlers = new Map<string, (value?: unknown) => void>()
		const socket = {
			connected: false,
			handlers,
			on: (name: string, callback: (value?: unknown) => void) => {
				handlers.set(name, callback)
			},
			connect: () => {
				socket.connected = true
				handlers.get('connect')?.()
			},
			disconnect: () => {
				socket.connected = false
			},
			removeAllListeners: () => handlers.clear(),
			timeout: () => socket,
			emitWithAck: vi.fn(),
		}
		sockets.push(socket)
		return socket
	})
	return { sockets, connectSocket }
})

const origin = 'https://chat.example.test'
const conversationId = 'guest-thread'
const clients: ChatClient[] = []
const http = vi.fn<typeof fetch>()
const message = (id: string, input?: MessageInput): ChatMessage => ({
	id,
	conversationId,
	createdAt: `2026-09-24T10:00:${id.padStart(2, '0')}.000Z`,
	authorType: input ? 'CLIENT' : 'STAFF',
	kind: 'TEXT',
	body: input?.body ?? `Message ${id}`,
	requestId: input?.requestId ?? id,
})
const response = (body: object, status = 200) =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	}) as Response
const session = () =>
	response({
		conversationId,
		token: crypto.randomUUID(),
		expiresAt: Date.now() + 900_000,
		guestExpiresAt: Date.now() + 30 * 86400_000,
	})
const flush = () => vi.advanceTimersByTimeAsync(0)
const client = () => {
	const value = new ChatClient(
		origin,
		connectSocket as unknown as ConstructorParameters<typeof ChatClient>[1],
	)
	clients.push(value)
	return value
}

beforeEach(() => {
	vi.useFakeTimers()
	const values = new Map<string, string>()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	})
	vi.stubGlobal('fetch', http)
	http.mockImplementation(async (url) =>
		String(url).endsWith('/guest/session')
			? session()
			: response({ items: [], nextCursor: null }),
	)
})
afterEach(() => {
	for (const value of clients.splice(0)) value.stop()
	sockets.length = 0
	vi.clearAllMocks()
	http.mockReset()
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

test('opening creates no request; explicit start saves the guest key before exchanging it', async () => {
	const value = client()
	expect(http).not.toHaveBeenCalled()
	expect(value.resumable).toBe(false)
	http.mockImplementation(async (url, options) => {
		if (String(url).endsWith('/guest/session')) {
			expect(options?.headers).toMatchObject({
				Authorization: `Bearer ${readIdentity(origin)?.key}`,
			})
			expect(options?.body).toBe('{}')
			return session()
		}
		return response({ items: [], nextCursor: null })
	})
	value.start()
	await flush()
	expect(value.getSnapshot().status).toBe('live')
	expect(value.getSnapshot().initialized).toBe(true)
	expect(readIdentity(origin)?.key).toMatch(/^[A-Za-z0-9_-]{43}$/)
	expect(client().resumable).toBe(true)
})

test('lost acknowledgements keep the exact message and request ID through reload and retry', async () => {
	const first = client()
	first.start()
	await flush()
	sockets[0].emitWithAck.mockRejectedValueOnce(new Error('timeout'))
	await first.send('  Hello  ')
	const pending = first.getSnapshot().pending!
	expect(pending.body).toBe('Hello')
	expect(first.getSnapshot().error).toBe('send')
	first.stop()
	const resumed = client()
	resumed.start()
	await flush()
	expect(resumed.getSnapshot().pending).toEqual(pending)
	sockets[1].emitWithAck.mockResolvedValue({
		ok: true,
		message: message('1', pending),
	})
	await resumed.send('Changed draft')
	expect(sockets[1].emitWithAck).toHaveBeenCalledWith('message:send', pending)
	expect(resumed.getSnapshot().pending).toBeNull()
	expect(readIdentity(origin)?.pending).toBeNull()
	expect(resumed.getSnapshot().messages).toHaveLength(1)
})

test('live persistence confirms a send even when its acknowledgement is lost', async () => {
	const value = client()
	value.start()
	await flush()
	sockets[0].emitWithAck.mockImplementation(
		async (_event, input: MessageInput) => {
			sockets[0].handlers.get('message:created')?.(message('1', input))
			throw new Error('timeout')
		},
	)
	await value.send('Saved')
	expect(value.getSnapshot().pending).toBeNull()
	expect(value.getSnapshot().error).toBeNull()
	sockets[0].handlers.get('message:created')?.(value.getSnapshot().messages[0])
	sockets[0].handlers.get('message:created')?.({
		...message('2'),
		conversationId: 'another-thread',
	})
	expect(value.getSnapshot().messages).toHaveLength(1)
})

test('reconnection catches up across pages without dropping events racing history', async () => {
	const value = client()
	http
		.mockResolvedValueOnce(session())
		.mockResolvedValueOnce(
			response({ items: [message('1')], nextCursor: null }),
		)
	value.start()
	await flush()
	sockets[0].handlers.get('disconnect')?.()
	http
		.mockResolvedValueOnce(session())
		.mockImplementationOnce(async () => {
			sockets[1].handlers.get('message:created')?.(message('6'))
			return response({ items: [message('4'), message('5')], nextCursor: '4' })
		})
		.mockResolvedValueOnce(
			response({ items: [message('2'), message('3')], nextCursor: '2' }),
		)
		.mockResolvedValueOnce(
			response({ items: [message('1')], nextCursor: null }),
		)
	await vi.advanceTimersByTimeAsync(1000)
	expect(value.getSnapshot().messages.map((item) => item.id)).toEqual([
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
	])
	expect(http.mock.calls.map(([url]) => String(url))).toContain(
		`${origin}/conversations/${conversationId}/messages?before=2`,
	)
	expect(connectSocket).toHaveBeenCalledTimes(2)
})

test('renews short-lived tokens using the same credential and cleans up on unmount', async () => {
	const value = client()
	value.start()
	await flush()
	const key = readIdentity(origin)?.key
	await vi.advanceTimersByTimeAsync(896_000)
	expect(connectSocket).toHaveBeenCalledTimes(2)
	expect(readIdentity(origin)?.key).toBe(key)
	expect(sockets[0].connected).toBe(false)
	value.stop()
	const count = http.mock.calls.length
	await vi.advanceTimersByTimeAsync(1000_000)
	expect(http).toHaveBeenCalledTimes(count)
	expect(sockets[1].connected).toBe(false)
})

test('expired guests require an explicit new chat, while unavailable storage permits a tab-only chat', async () => {
	const identity = newIdentity()
	saveIdentity(origin, identity)
	http.mockResolvedValueOnce(response({ error: 'Expired' }, 410))
	const value = client()
	value.start()
	await flush()
	expect(value.getSnapshot().status).toBe('expired')
	await vi.advanceTimersByTimeAsync(60_000)
	expect(http).toHaveBeenCalledTimes(1)
	expect(readIdentity(origin)?.key).toBe(identity.key)
	vi.stubGlobal('localStorage', {
		getItem: () => {
			throw new Error('Disabled')
		},
		setItem: () => {
			throw new Error('Disabled')
		},
	})
	value.startNew()
	await flush()
	expect(value.getSnapshot().status).toBe('live')
	expect(value.getSnapshot().persistent).toBe(false)
})

test('empty initialized threads recover all pages and merging is ordered and idempotent', async () => {
	const load = vi
		.fn()
		.mockResolvedValueOnce({ items: [message('3')], nextCursor: '3' })
		.mockResolvedValueOnce({
			items: [message('1'), message('2')],
			nextCursor: null,
		})
	const page = await catchUpMessages(load, null, true)
	expect(page.items.map((item) => item.id)).toEqual(['1', '2', '3'])
	expect(
		mergeMessages([message('3')], [message('1'), message('3')]).map(
			(item) => item.id,
		),
	).toEqual(['1', '3'])
})

test('stopping during the guest exchange aborts REST and ignores a late session', async () => {
	const exchange = Promise.withResolvers<Response>()
	http.mockReturnValueOnce(exchange.promise)
	const value = client()
	value.start()
	const signal = http.mock.calls[0][1]?.signal
	expect(signal?.aborted).toBe(false)

	value.stop()
	expect(signal?.aborted).toBe(true)
	exchange.resolve(session())
	await flush()
	await vi.advanceTimersByTimeAsync(60_000)

	expect(connectSocket).not.toHaveBeenCalled()
	expect(http).toHaveBeenCalledTimes(1)
	expect(value.getSnapshot().initialized).toBe(false)
})

test('reconnecting preserves the older-history cursor and ignores an interrupted page', async () => {
	http
		.mockResolvedValueOnce(session())
		.mockResolvedValueOnce(response({ items: [message('3')], nextCursor: '3' }))
	const value = client()
	value.start()
	await flush()

	const older = Promise.withResolvers<Response>()
	http.mockReturnValueOnce(older.promise)
	const loading = value.loadOlder()
	const signal = http.mock.calls.at(-1)?.[1]?.signal
	expect(value.getSnapshot().loadingOlder).toBe(true)

	sockets[0].handlers.get('disconnect')?.()
	expect(signal?.aborted).toBe(true)
	http
		.mockResolvedValueOnce(session())
		.mockResolvedValueOnce(
			response({ items: [message('3'), message('4')], nextCursor: '3' }),
		)
	await vi.advanceTimersByTimeAsync(1000)

	older.resolve(
		response({ items: [message('1'), message('2')], nextCursor: null }),
	)
	await loading
	expect(value.getSnapshot()).toMatchObject({
		status: 'live',
		nextCursor: '3',
		loadingOlder: false,
		error: null,
	})
	expect(value.getSnapshot().messages.map((item) => item.id)).toEqual([
		'3',
		'4',
	])

	http.mockResolvedValueOnce(
		response({ items: [message('1'), message('2')], nextCursor: null }),
	)
	await value.loadOlder()
	expect(http.mock.calls.at(-1)?.[0]).toBe(
		`${origin}/conversations/${conversationId}/messages?before=3`,
	)
	expect(value.getSnapshot().messages.map((item) => item.id)).toEqual([
		'1',
		'2',
		'3',
		'4',
	])
	expect(value.getSnapshot().nextCursor).toBeNull()
})
