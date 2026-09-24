// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer as createHttpServer, request } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer, resolveConfig, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { messagingProxyPlugin } from '../../vite-shared/src/messaging'

let root: string
let vite: ViteDevServer
let origin: string
const upstreamRequests: string[] = []
const upstream = createHttpServer(async (req, res) => {
	upstreamRequests.push(req.url!)
	let body = ''
	for await (const chunk of req) body += chunk
	res.setHeader('Content-Type', 'application/json')
	res.end(
		JSON.stringify({
			url: req.url,
			method: req.method,
			authorization: req.headers.authorization,
			body,
		}),
	)
})

beforeAll(async () => {
	root = await mkdtemp(path.join(tmpdir(), 'messaging-proxy-'))
	upstream.on('upgrade', (req, socket) => {
		upstreamRequests.push(req.url!)
		const accept = createHash('sha1')
			.update(
				`${req.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
			)
			.digest('base64')
		socket.end(
			`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
		)
	})
	upstream.listen(0, '127.0.0.1')
	await once(upstream, 'listening')
	const target = `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`
	vite = await createServer({
		root,
		configFile: false,
		logLevel: 'silent',
		plugins: [
			messagingProxyPlugin(),
			{
				name: 'test-messaging-upstream',
				configResolved(config) {
					for (const proxy of Object.values(config.server.proxy ?? {})) {
						if (typeof proxy !== 'string') proxy.target = target
					}
				},
			},
		],
		server: { host: '127.0.0.1', port: 0, ws: false },
	})
	await vite.listen()
	origin = `http://127.0.0.1:${(vite.httpServer!.address() as AddressInfo).port}`
})

afterAll(async () => {
	await vite?.close()
	upstream.close()
	if (root) await rm(root, { recursive: true, force: true })
})

test.each([
	['POST', '/guest/session', '{}'],
	['GET', '/conversations/guest-thread/messages?before=123', ''],
	['GET', '/socket.io/?EIO=4&transport=polling', ''],
	['POST', '/socket.io/?EIO=4&transport=polling&sid=test', '40'],
])('forwards %s %s with its credential and body', async (method, url, body) => {
	const response = await fetch(`${origin}${url}`, {
		method,
		headers: { Authorization: 'Bearer test-guest-credential' },
		...(body ? { body } : {}),
	})
	expect(response.status).toBe(200)
	expect(await response.json()).toEqual({
		url,
		method,
		authorization: 'Bearer test-guest-credential',
		body,
	})
})

test('forwards the Socket.IO WebSocket upgrade', async () => {
	const url = '/socket.io/?EIO=4&transport=websocket'
	await new Promise<void>((resolve, reject) => {
		const req = request(`${origin}${url}`, {
			headers: {
				Connection: 'Upgrade',
				Upgrade: 'websocket',
				'Sec-WebSocket-Version': '13',
				'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
			},
		})
		req.on('upgrade', (_, socket) => {
			socket.destroy()
			resolve()
		})
		req.on('error', reject)
		req.on('response', (response) => {
			response.resume()
			reject(
				new Error(`Expected WebSocket upgrade, got ${response.statusCode}`),
			)
		})
		req.setTimeout(3000, () => req.destroy(new Error('Upgrade timed out')))
		req.end()
	})
	expect(upstreamRequests.at(-1)).toBe(url)
})

test('does not expose other messaging server routes', async () => {
	const count = upstreamRequests.length
	for (const route of [
		'/health',
		'/guest/session-other',
		'/conversations/guest-thread/messages/extra',
		'/socket.io-other/',
	]) {
		expect((await fetch(`${origin}${route}`)).status).toBe(404)
	}
	expect(upstreamRequests).toHaveLength(count)
})

test.each([
	['build', 'production', false],
	['build', 'development', false],
	['serve', 'production', true],
] as const)(
	'omits the local proxy for %s in %s mode (preview: %s)',
	async (command, mode, isPreview) => {
		const config = await resolveConfig(
			{ root, configFile: false, mode, plugins: [messagingProxyPlugin()] },
			command,
			mode,
			'production',
			isPreview,
		)
		expect(config.server.proxy).toBeUndefined()
		expect(
			config.define?.['import.meta.env.MESSAGING_DEV_PROXY'],
		).toBeUndefined()
	},
)
