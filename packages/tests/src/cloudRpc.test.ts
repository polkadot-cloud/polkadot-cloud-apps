// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer as createHttpServer, request } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer, resolveConfig, type ViteDevServer } from 'vite'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'
import { cloudRpcPlugin } from '../../vite-shared/src/index'

const token = 'test-dev-token'
const proxyRoute = '^/__cloud_rpc/(statemint|people)$'
let root: string
let vite: ViteDevServer
let origin: string
const upstreamRequests: { url?: string; authorization?: string }[] = []
const upstream = createHttpServer()

beforeAll(async () => {
	root = await mkdtemp(path.join(tmpdir(), 'cloud-rpc-'))
	await writeFile(path.join(root, 'pnpm-workspace.yaml'), 'packages: []\n')
	await writeFile(path.join(root, '.env'), `CLOUD_RPC_AUTH_TOKEN=${token}\n`)
	vi.stubEnv('CLOUD_RPC_AUTH_TOKEN', token)

	upstream.on('upgrade', (req, socket) => {
		upstreamRequests.push({
			url: req.url,
			authorization: req.headers.authorization,
		})
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
	const upstreamPort = (upstream.address() as AddressInfo).port

	vite = await createServer({
		root,
		configFile: false,
		logLevel: 'silent',
		plugins: [
			cloudRpcPlugin(),
			{
				name: 'local-test-upstream',
				config: () => ({
					server: {
						proxy: {
							[proxyRoute]: { target: `http://127.0.0.1:${upstreamPort}` },
						},
					},
				}),
			},
		],
		server: { host: '127.0.0.1', port: 0, ws: false },
	})
	await vite.listen()
	origin = `http://127.0.0.1:${(vite.httpServer!.address() as AddressInfo).port}`
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.unstubAllEnvs()
	vi.resetModules()
})

afterAll(async () => {
	await vite?.close()
	upstream.close()
	if (root) await rm(root, { recursive: true, force: true })
})

test.each(['statemint', 'people'])(
	'adds Bearer auth to the %s WebSocket upgrade',
	async (chain) => {
		await new Promise<void>((resolve, reject) => {
			const req = request(`${origin}/__cloud_rpc/${chain}`, {
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
		expect(upstreamRequests.at(-1)).toEqual({
			url: `/${chain}`,
			authorization: `Bearer ${token}`,
		})
	},
)

test('does not proxy any other RPC path', async () => {
	const count = upstreamRequests.length
	for (const route of ['relay', 'statemint/extra', 'people-other']) {
		const response = await fetch(`${origin}/__cloud_rpc/${route}`)
		expect(response.status).toBe(404)
	}
	expect(upstreamRequests).toHaveLength(count)
})

test('exposes only the proxy path to client code', () => {
	expect(vite.config.define).toEqual({
		'import.meta.env.CLOUD_RPC_PROXY_PATH': '"/__cloud_rpc"',
	})
	expect(JSON.stringify(vite.config.env)).not.toContain(token)
})

test.each(['http://localhost:5173', 'https://dev.example.test'])(
	'routes only Cloud endpoints through the development origin %s',
	async (devOrigin) => {
		vi.stubEnv('PROD', false)
		vi.stubEnv('CLOUD_RPC_PROXY_PATH', '/__cloud_rpc')
		vi.stubGlobal('window', { location: { origin: devOrigin } })
		const { RpcEndpointsByChain, getRpcEndpointList } = await import(
			'../../consts/src/rpc'
		)
		const wsOrigin = devOrigin.replace(/^http/, 'ws')
		expect(RpcEndpointsByChain.statemint['Polkadot Cloud']).toBe(
			`${wsOrigin}/__cloud_rpc/statemint`,
		)
		expect(RpcEndpointsByChain['people-polkadot']['Polkadot Cloud']).toBe(
			`${wsOrigin}/__cloud_rpc/people`,
		)
		expect(getRpcEndpointList('statemint')).toContain(
			'wss://asset-hub.polkadot.rpc.deserve.network',
		)
		expect(getRpcEndpointList('polkadot')).not.toContain(
			expect.stringContaining('/__cloud_rpc/'),
		)
	},
)

test('keeps direct Cloud endpoints and defaults in production without a token', async () => {
	vi.stubEnv('PROD', true)
	vi.stubEnv('CLOUD_RPC_AUTH_TOKEN', undefined)
	vi.stubEnv('CLOUD_RPC_PROXY_PATH', undefined)
	const { DefaultRpcProviderByChain, RpcEndpointsByChain } = await import(
		'../../consts/src/rpc'
	)
	expect(RpcEndpointsByChain.statemint['Polkadot Cloud']).toBe(
		'wss://rpc.polkadot.cloud/statemint',
	)
	expect(RpcEndpointsByChain['people-polkadot']['Polkadot Cloud']).toBe(
		'wss://rpc.polkadot.cloud/people',
	)
	expect(DefaultRpcProviderByChain.statemint).toBe('Polkadot Cloud')
	expect(DefaultRpcProviderByChain['people-polkadot']).toBe('Polkadot Cloud')
})

test.each([undefined, ''])(
	'omits Cloud endpoints and defaults in development without a proxy (%s)',
	async (proxyPath) => {
		vi.stubEnv('PROD', false)
		vi.stubEnv('CLOUD_RPC_PROXY_PATH', proxyPath)
		const {
			DefaultRpcProviderByChain,
			RpcEndpointsByChain,
			getRpcEndpointList,
		} = await import('../../consts/src/rpc')
		for (const chain of ['statemint', 'people-polkadot'] as const) {
			expect(RpcEndpointsByChain[chain]).not.toHaveProperty('Polkadot Cloud')
			expect(DefaultRpcProviderByChain[chain]).toBeUndefined()
			const endpoints = getRpcEndpointList(chain)
			expect(endpoints.length).toBeGreaterThan(0)
			expect(
				endpoints.every((url) => !url.includes('rpc.polkadot.cloud')),
			).toBe(true)
		}
	},
)

test('omits the proxy and client override from production builds', async () => {
	const config = await resolveConfig(
		{ root, configFile: false, plugins: [cloudRpcPlugin()] },
		'build',
	)
	expect(config.server.proxy).toBeUndefined()
	expect(
		config.define?.['import.meta.env.CLOUD_RPC_PROXY_PATH'],
	).toBeUndefined()
})

test('omits the proxy when no token is configured', async () => {
	vi.stubEnv('CLOUD_RPC_AUTH_TOKEN', '')
	const config = await resolveConfig(
		{ root, configFile: false, plugins: [cloudRpcPlugin()] },
		'serve',
	)
	expect(config.server.proxy).toBeUndefined()
	expect(
		config.define?.['import.meta.env.CLOUD_RPC_PROXY_PATH'],
	).toBeUndefined()
})
