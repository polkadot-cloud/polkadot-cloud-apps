// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import type { NetworkConfig } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
	getDefaultService: vi.fn(),
	start: vi.fn(),
	unsubscribe: vi.fn(),
}))
// Keep startup, storage and configuration notifications real; replace chain I/O.
vi.mock('../../dedot-api/src/start', () => ({
	getDefaultService: mocked.getDefaultService,
}))

const savedEndpoints = {
	polkadot: 'LuckyFriday',
	'people-polkadot': 'Sys Dotters',
	statemint: 'DeServe',
}
const cloudEndpoints = {
	...savedEndpoints,
	'people-polkadot': 'Polkadot Cloud',
	statemint: 'Polkadot Cloud',
}

beforeEach(() => {
	vi.resetModules()
	vi.clearAllMocks()
	vi.stubEnv('PROD', true)
	vi.stubEnv('CLOUD_RPC_PROXY_PATH', undefined)
	localStorage.clear()
	localStorage.setItem('migrationVersion', '2')
	localStorage.setItem('polkadotRpcEndpoints', JSON.stringify(savedEndpoints))
	window.history.replaceState({}, '', '/')
	mocked.getDefaultService.mockResolvedValue({
		Service: class {
			interface = {}
			start = mocked.start
			unsubscribe = mocked.unsubscribe
		},
		apis: [{}],
		ids: ['polkadot', 'people-polkadot', 'statemint'],
		providerRelay: {},
		providerPeople: {},
	})
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
	localStorage.clear()
})

const startService = async (forceCloudRpc = true) => {
	const { initDedotService } = await import('../../dedot-api/src')
	await initDedotService({ network: 'polkadot', forceCloudRpc })
	await vi.waitFor(() => expect(mocked.start).toHaveBeenCalledOnce())
	return import('../../global-bus/src/networkConfig')
}

test.each([
	null,
	'',
	'   ',
	'{"polkadot":',
	'not JSON',
	'null',
	'[]',
	'"LuckyFriday"',
	'42',
	'true',
	'{}',
	JSON.stringify({ polkadot: 'LuckyFriday' }),
	JSON.stringify({ ...savedEndpoints, statemint: 'Unknown provider' }),
	JSON.stringify({ ...savedEndpoints, statemint: 42 }),
])(
	'local swap starts with default RPCs when saved endpoints are %j',
	async (saved) => {
		vi.stubEnv('PROD', false)
		vi.spyOn(Math, 'random').mockReturnValue(0)
		if (saved === null) {
			localStorage.removeItem('polkadotRpcEndpoints')
		} else {
			localStorage.setItem('polkadotRpcEndpoints', saved)
		}
		const { getDefaultRpcEndpoints } = await import('../../consts/src/util/rpc')
		const defaults = getDefaultRpcEndpoints('polkadot')
		const { getNetworkConfig } = await startService()
		expect(mocked.getDefaultService).toHaveBeenCalledExactlyOnceWith(
			'polkadot',
			{
				rpcEndpoints: defaults,
				providerType: 'ws',
				autoRpc: false,
			},
		)
		expect(getNetworkConfig().rpcEndpoints).toEqual(defaults)
		expect(JSON.parse(localStorage.getItem('polkadotRpcEndpoints')!)).toEqual(
			defaults,
		)
	},
)

test.each([
	['ws', false],
	['ws', true],
	['sc', false],
	['sc', true],
] as const)(
	'Cloud RPCs override saved %s transport and Auto RPC %s',
	async (providerType, autoRpc) => {
		localStorage.setItem('providerType', providerType)
		localStorage.setItem('autoRpc', String(autoRpc))
		const { getNetworkConfig } = await startService()
		expect(mocked.getDefaultService).toHaveBeenCalledExactlyOnceWith(
			'polkadot',
			{ rpcEndpoints: cloudEndpoints, providerType: 'ws', autoRpc: false },
		)
		expect(getNetworkConfig()).toEqual({
			network: 'polkadot',
			rpcEndpoints: cloudEndpoints,
			providerType: 'ws',
			autoRpc: false,
		})
		expect(JSON.parse(localStorage.getItem('polkadotRpcEndpoints')!)).toEqual(
			cloudEndpoints,
		)
	},
)

test('later configuration changes cannot switch Cloud connections to saved alternatives', async () => {
	const { setNetworkConfig } = await startService()
	setNetworkConfig('polkadot', savedEndpoints, 'sc', true)
	// The effective configuration is unchanged, so the running service stays connected.
	await Promise.resolve()
	expect(mocked.getDefaultService).toHaveBeenCalledOnce()
	expect(mocked.unsubscribe).not.toHaveBeenCalled()
	setNetworkConfig(
		'polkadot',
		{ ...savedEndpoints, polkadot: 'OnFinality' },
		'sc',
		true,
	)
	await vi.waitFor(() => expect(mocked.start).toHaveBeenCalledTimes(2))
	expect(mocked.getDefaultService).toHaveBeenLastCalledWith('polkadot', {
		rpcEndpoints: { ...cloudEndpoints, polkadot: 'OnFinality' },
		providerType: 'ws',
		autoRpc: false,
	})
})

test('other apps retain their saved RPC, transport and Auto RPC choices', async () => {
	localStorage.setItem('providerType', 'sc')
	localStorage.setItem('autoRpc', 'true')
	const { initDedotService } = await import('../../dedot-api/src')
	await initDedotService({ network: 'polkadot' })
	await vi.waitFor(() => expect(mocked.start).toHaveBeenCalledOnce())
	expect(mocked.getDefaultService).toHaveBeenCalledExactlyOnceWith('polkadot', {
		rpcEndpoints: savedEndpoints,
		providerType: 'sc',
		autoRpc: true,
	})
})

test('development without Cloud enabled retains the saved configuration', async () => {
	vi.stubEnv('PROD', false)
	localStorage.setItem('providerType', 'sc')
	localStorage.setItem('autoRpc', 'true')
	await startService()
	expect(mocked.getDefaultService).toHaveBeenCalledExactlyOnceWith('polkadot', {
		rpcEndpoints: savedEndpoints,
		providerType: 'sc',
		autoRpc: true,
	})
})

test('development with the authenticated proxy pins both Cloud RPCs', async () => {
	vi.stubEnv('PROD', false)
	vi.stubEnv('CLOUD_RPC_PROXY_PATH', '/__cloud_rpc')
	await startService()
	const { RpcEndpointsByChain } = await import('../../consts/src/rpc')
	expect(mocked.getDefaultService).toHaveBeenCalledExactlyOnceWith('polkadot', {
		rpcEndpoints: cloudEndpoints,
		providerType: 'ws',
		autoRpc: false,
	})
	expect(RpcEndpointsByChain['people-polkadot']['Polkadot Cloud']).toBe(
		`${window.location.origin.replace(/^http/, 'ws')}/__cloud_rpc/people`,
	)
})

test('only chains with enabled Cloud endpoints are overridden', async () => {
	const { SystemChainList } = await import('../../consts/src/networks')
	const { resolveServiceNetworkConfig } = await import(
		'../../dedot-api/src/networkConfig'
	)
	const original = SystemChainList.statemint.endpoints.rpc
	try {
		SystemChainList.statemint.endpoints.rpc = { DeServe: original.DeServe }
		const config: NetworkConfig = {
			network: 'polkadot',
			rpcEndpoints: savedEndpoints,
			providerType: 'ws',
			autoRpc: false,
		}
		expect(resolveServiceNetworkConfig(config, true).rpcEndpoints).toEqual({
			...savedEndpoints,
			'people-polkadot': 'Polkadot Cloud',
		})
		expect(config.rpcEndpoints).toEqual(savedEndpoints)
	} finally {
		SystemChainList.statemint.endpoints.rpc = original
	}
})
