// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, loadConfigFromFile, loadEnv } from 'vite'
import { afterEach, expect, test, vi } from 'vitest'

const token = 'test-staking-api-secret'
const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url))
const apps = ['staking', 'nominate', 'validators', 'swap']

const loadAppConfig = async (
	app: string,
	command: 'serve' | 'build',
	mode = 'production',
	isPreview = false,
) => {
	const root = path.join(repositoryRoot, 'packages', `app-${app}`)
	const result = await loadConfigFromFile(
		{ command, mode, isPreview },
		path.join(root, 'vite.config.ts'),
		root,
		'silent',
	)
	if (!result) throw new Error(`Missing Vite config for ${app}`)
	return { root, config: result.config }
}

afterEach(() => {
	vi.unstubAllGlobals()
	vi.unstubAllEnvs()
	vi.resetModules()
})

test.each([
	[true, `  ${token}  `, `Bearer ${token}`],
	[true, undefined, null],
	[true, '', null],
	[true, '   ', null],
	[false, token, null],
])(
	'sends direct Apollo HTTP headers for DEV=%s and token=%s',
	async (dev, value, expected) => {
		vi.stubEnv('DEV', dev as boolean)
		vi.stubEnv('CLOUD_STAKING_API_AUTH_TOKEN', value as string | undefined)
		const data = { tokenPrice: { price: 42, change: 1 } }
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
			new Response(JSON.stringify({ data }), {
				headers: { 'Content-Type': 'application/json' },
			}),
		)
		vi.stubGlobal('fetch', fetchMock)
		const { fetchTokenPrice } = await import(
			'../../plugin-staking-api/src/queries/tokenPrice'
		)
		expect(await fetchTokenPrice('DOT')).toEqual(data)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, options] = fetchMock.mock.calls[0]
		expect(url).toBe('https://api.staking.polkadot.cloud')
		expect(options?.method).toBe('POST')
		expect(new Headers(options?.headers).get('authorization')).toBe(expected)
		expect(JSON.parse(options?.body as string).variables).toEqual({
			ticker: 'DOT',
		})
	},
)

test.each(apps)(
	'%s exposes only the staking API token in development',
	async (app) => {
		vi.stubEnv('CLOUD_STAKING_API_AUTH_TOKEN', token)
		vi.stubEnv('CLOUD_RPC_AUTH_TOKEN', 'private-rpc-token')
		vi.stubEnv('OPENAI_API_KEY', 'private-other-key')
		const { root, config } = await loadAppConfig(app, 'serve', 'development')
		const env = loadEnv(
			'development',
			path.resolve(root, config.envDir!),
			config.envPrefix,
		)
		expect(path.resolve(root, config.envDir!)).toBe(
			repositoryRoot.replace(/\/$/, ''),
		)
		expect(env.CLOUD_STAKING_API_AUTH_TOKEN).toBe(token)
		expect(env.CLOUD_RPC_AUTH_TOKEN).toBeUndefined()
		expect(env.OPENAI_API_KEY).toBeUndefined()
	},
)

test.each(apps)(
	'%s excludes the token from builds and preview',
	async (app) => {
		vi.stubEnv('CLOUD_STAKING_API_AUTH_TOKEN', token)
		for (const { command, mode, isPreview } of [
			{ command: 'build' as const, mode: 'production', isPreview: false },
			{ command: 'build' as const, mode: 'development', isPreview: false },
			{ command: 'serve' as const, mode: 'production', isPreview: true },
		]) {
			const { root, config } = await loadAppConfig(
				app,
				command,
				mode,
				isPreview,
			)
			const env = loadEnv(
				mode,
				path.resolve(root, config.envDir!),
				config.envPrefix,
			)
			expect(env.CLOUD_STAKING_API_AUTH_TOKEN).toBeUndefined()
		}
	},
)

test.each(['production', 'development'])(
	'keeps the token out of %s browser bundles',
	async (mode) => {
		const workspace = await mkdtemp(path.join(tmpdir(), 'staking-api-headers-'))
		try {
			const root = path.join(workspace, 'packages', 'app')
			await mkdir(root, { recursive: true })
			await writeFile(
				path.join(workspace, '.env'),
				`CLOUD_STAKING_API_AUTH_TOKEN=${token}\n`,
			)
			await writeFile(
				path.join(root, 'index.html'),
				'<script type="module" src="/client.js"></script>',
			)
			const clientPath = path.join(
				repositoryRoot,
				'packages/plugin-staking-api/src/Client.ts',
			)
			await writeFile(
				path.join(root, 'client.js'),
				`import { client } from ${JSON.stringify(clientPath)}; console.log(client, import.meta.env)`,
			)
			const { config } = await loadAppConfig('staking', 'build', mode)
			const result = await build({
				root,
				mode,
				configFile: false,
				logLevel: 'silent',
				envDir: config.envDir,
				envPrefix: config.envPrefix,
				build: { write: false },
			})
			expect(JSON.stringify(result)).not.toContain(token)
		} finally {
			await rm(workspace, { recursive: true, force: true })
		}
	},
)
