// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { DedotClient, type SubmittableExtrinsic } from 'dedot'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, test, vi } from 'vitest'
import {
	getFeeAssetOptions,
	getTokenOptions,
} from '../../app-swap/src/library/AssetTransfer/options'
import { useSendSelection } from '../../app-swap/src/pages/Send/hooks/useSendSelection'
import { PolkadotService } from '../../dedot-api/src/services/polkadot'
import { createStablecoinsInterface } from '../../dedot-api/src/stablecoins'
import { createPeopleStablecoinAdapter } from '../../dedot-api/src/stablecoins/people'
import { maxSendableBalance } from '../../utils/src'

type PeopleApi = Awaited<
	ReturnType<Parameters<typeof createPeopleStablecoinAdapter>[0]>
>

const mocked = vi.hoisted(() => ({ prepare: vi.fn() }))
vi.mock('../../dedot-api/src/xcm', () => ({
	prepareCrossChainTransfer: mocked.prepare,
}))

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

let selection: ReturnType<typeof useSendSelection>
const SendSelectionHarness = () => {
	selection = useSendSelection()
	return null
}

test('Send switches the selected token and fee token to DOT when People is selected', async () => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	const root = createRoot(document.createElement('div'))
	try {
		await act(async () => root.render(createElement(SendSelectionHarness)))
		expect(selection.token).toBe('USDC')
		await act(async () => {
			selection.setSelectedFeeAsset({ value: 'USDT', label: 'USDT' })
			selection.setSelectedChain({
				value: 'people-polkadot',
				label: 'Polkadot People',
			})
		})
		expect(selection.token).toBe('DOT')
		expect(selection.feeAsset).toBe('DOT')
		expect(selection.selectedChain.value).toBe('people-polkadot')
		expect(selection.tokenOptions.map(({ value }) => value)).toEqual(['DOT'])
		expect(
			selection.availableFeeAssetOptions.map(({ value }) => value),
		).toEqual(['DOT'])
	} finally {
		await act(async () => root.unmount())
	}
})

test('People exposes only DOT and builds native keep-alive sends with native fees', async () => {
	for (const getOptions of [getTokenOptions, getFeeAssetOptions]) {
		expect(getOptions('people-polkadot').map(({ value }) => value)).toEqual([
			'DOT',
		])
	}
	const paymentInfo = vi.fn().mockResolvedValue({ partialFee: 1_000_000n })
	const tx = { paymentInfo } as unknown as SubmittableExtrinsic
	const transferKeepAlive = vi.fn().mockReturnValue(tx)
	const account = vi
		.fn()
		.mockResolvedValue({ data: { free: 20_000_000_000n, frozen: 0n } })
	const getApi = vi.fn(
		async () =>
			({
				query: { system: { account } },
				tx: { balances: { transferKeepAlive } },
			}) as unknown as PeopleApi,
	)
	const adapter = createPeopleStablecoinAdapter(getApi)
	const balance = await adapter.balance('sender', 'DOT')
	expect(balance).toEqual({
		chain: 'people-polkadot',
		symbol: 'DOT',
		free: 20_000_000_000n,
		frozen: 0n,
		decimals: 10,
		existentialDeposit: 1_000_000_000n,
	})
	expect(
		await adapter.transfer({
			chain: 'people-polkadot',
			symbol: 'DOT',
			recipient: 'recipient',
			amount: 12_345_678_901n,
		}),
	).toBe(tx)
	expect(transferKeepAlive).toHaveBeenCalledWith('recipient', 12_345_678_901n)
	expect(adapter.paymentOptions('DOT')).toBeUndefined()
	const fee = await adapter.estimateFee({
		chain: 'people-polkadot',
		symbol: 'DOT',
		tx,
		from: 'sender',
	})
	expect(fee).toBe(1_000_000n)
	expect(paymentInfo).toHaveBeenCalledWith('sender', undefined)
	expect(maxSendableBalance(balance, balance, fee)).toBe(18_999_000_000n)
	getApi.mockClear()
	expect(await adapter.balance('sender', 'USDC')).toBeUndefined()
	expect(
		await adapter.transfer({
			chain: 'people-polkadot',
			symbol: 'USDC',
			recipient: 'recipient',
			amount: 1n,
		}),
	).toBeUndefined()
	expect(getApi).not.toHaveBeenCalled()
})

const createService = (people = true, assetHub = false, hydration = false) => {
	const provider = {} as ConstructorParameters<typeof PolkadotService>[3]
	const hub = {
		on: vi.fn(),
		runtimeVersion: { specName: 'statemint' },
	} as unknown as ConstructorParameters<typeof PolkadotService>[2]
	return new PolkadotService(
		{
			network: 'polkadot',
			rpcEndpoints: {},
			providerType: 'ws',
			autoRpc: true,
		},
		['polkadot', 'people-polkadot', 'statemint'],
		hub,
		provider,
		provider,
		{ stablecoins: { assetHub, hydration, people } },
	)
}

test('simultaneous identity and transfer requests await the same People client and signing uses its metadata', async () => {
	let resolve!: (api: PeopleApi) => void
	const connect = vi.spyOn(DedotClient, 'new').mockImplementation(
		() =>
			new Promise<PeopleApi>((done) => {
				resolve = done
			}) as ReturnType<typeof DedotClient.new>,
	)
	const service = createService()
	const identity = service.interface.query.identityOfMulti(['sender'])
	const superOf = service.interface.query.superOfMulti(['sender'])
	const balance = service.interface.stablecoins.query.balance(
		'sender',
		'people-polkadot',
		'DOT',
	)
	const anotherConnection = service.getPeopleApi()
	const metadataAtVersion = vi.fn().mockResolvedValue('people-metadata')
	const findCodec = vi.fn().mockReturnValue('people-signature')
	const people = {
		runtimeVersion: { specName: 'people-polkadot' },
		consts: { system: { ss58Prefix: 0 } },
		query: {
			system: {
				account: vi
					.fn()
					.mockResolvedValue({ data: { free: 10_000_000_000n, frozen: 0n } }),
			},
			identity: {
				identityOf: { multi: vi.fn().mockResolvedValue([undefined]) },
				superOf: { multi: vi.fn().mockResolvedValue([]) },
			},
		},
		call: { metadata: { metadataAtVersion } },
		registry: { findCodec, metadata: { extrinsic: { signatureTypeId: 7 } } },
	} as unknown as PeopleApi
	expect(connect).toHaveBeenCalledOnce()
	expect(connect).toHaveBeenCalledWith({
		provider: service.providerPeople,
		cacheMetadata: true,
	})
	resolve(people)
	expect(await identity).toEqual([undefined])
	expect(await superOf).toEqual([])
	expect(await balance).toMatchObject({
		chain: 'people-polkadot',
		free: 10_000_000_000n,
	})
	expect(await anotherConnection).toBe(people)
	expect(service.getSigningApi('people-polkadot')).toBe(people)
	expect(await service.interface.signer.metadata('people-polkadot')).toBe(
		'people-metadata',
	)
	expect(service.interface.codec.$Signature('people-polkadot')).toBe(
		'people-signature',
	)
	expect(findCodec).toHaveBeenCalledWith(7)
	expect(service.getSigningApi('statemint')).toBe(service.apiHub)
	expect(connect).toHaveBeenCalledOnce()
})

test('a failed People connection rejects both consumers and can be retried', async () => {
	const people = {} as PeopleApi
	const connect = vi
		.spyOn(DedotClient, 'new')
		.mockRejectedValueOnce(new Error('Disconnected'))
		.mockResolvedValueOnce(people)
	const service = createService()
	const results = await Promise.allSettled([
		service.interface.query.identityOfMulti(['sender']),
		service.interface.stablecoins.query.balance(
			'sender',
			'people-polkadot',
			'DOT',
		),
	])
	expect(results.map(({ status }) => status)).toEqual(['rejected', 'rejected'])
	expect(await service.getPeopleApi()).toBe(people)
	expect(connect).toHaveBeenCalledTimes(2)
})

test('Hydration consumers share one pending client with metadata caching enabled', async () => {
	type HydrationApi = Awaited<ReturnType<PolkadotService['getHydrationApi']>>
	let resolve!: (api: HydrationApi) => void
	const connect = vi.spyOn(DedotClient, 'new').mockImplementation(
		() =>
			new Promise<HydrationApi>((done) => {
				resolve = done
			}) as ReturnType<typeof DedotClient.new>,
	)
	const service = createService(true, true, true)
	const first = service.getHydrationApi()
	const second = service.getHydrationApi()
	expect(second).toBe(first)
	expect(connect).toHaveBeenCalledOnce()
	expect(connect).toHaveBeenCalledWith({
		provider: expect.any(Object),
		cacheMetadata: true,
	})
	const hydration = {
		runtimeVersion: { specName: 'hydradx' },
	} as HydrationApi
	resolve(hydration)
	expect(await first).toBe(hydration)
	expect(await second).toBe(hydration)
	expect(await service.getHydrationApi()).toBe(hydration)
	expect(service.getSigningApi('hydradx')).toBe(hydration)
	expect(connect).toHaveBeenCalledOnce()
})

test('disabling People leaves its balance service and connection unused', async () => {
	const connect = vi.spyOn(DedotClient, 'new')
	const service = createService(false, true)
	expect(
		await service.interface.stablecoins.query.balance(
			'sender',
			'people-polkadot',
			'DOT',
		),
	).toBeUndefined()
	const onError = vi.fn()
	const unsubscribe = service.interface.stablecoins.subscribe.balances(
		'sender',
		'people-polkadot',
		vi.fn(),
		onError,
	)
	expect(onError).toHaveBeenCalledWith(
		expect.objectContaining({
			message: 'Balance subscriptions unavailable for people-polkadot',
		}),
	)
	unsubscribe()
	expect(connect).not.toHaveBeenCalled()
})

test('People–Hub preparation reuses the configured clients without opening Hydration', async () => {
	const people = {} as PeopleApi
	const connect = vi.spyOn(DedotClient, 'new').mockResolvedValue(people)
	const service = createService(true, true, true)
	for (const [from, to] of [
		['statemint', 'people-polkadot'],
		['people-polkadot', 'statemint'],
	] as const) {
		const input = {
			from,
			to,
			symbol: 'DOT',
			feeAsset: 'DOT',
			amount: 10_000_000_000n,
			sender: 'sender',
			recipient: 'recipient',
		} as const
		await service.interface.stablecoins.xcm!.prepare(input)
		expect(mocked.prepare).toHaveBeenLastCalledWith(
			{
				statemint: service.apiHub,
				hydration: undefined,
				'people-polkadot': people,
			},
			input,
		)
	}
	expect(connect).toHaveBeenCalledOnce()
	expect(connect).toHaveBeenCalledWith({
		provider: service.providerPeople,
		cacheMetadata: true,
	})
})

test.each([
	['people-polkadot', 'hydration'],
	['hydration', 'people-polkadot'],
] as const)('%s → %s connects both chains concurrently', async (from, to) => {
	let resolveHydration!: (
		api: Awaited<ReturnType<Parameters<typeof createStablecoinsInterface>[1]>>,
	) => void
	const hydration = {} as Parameters<typeof resolveHydration>[0]
	const people = {} as PeopleApi
	const getHydrationApi = vi.fn(
		() =>
			new Promise<typeof hydration>((resolve) => {
				resolveHydration = resolve
			}),
	)
	const getPeopleApi = vi.fn().mockResolvedValue(people)
	const hub = {} as Parameters<typeof createStablecoinsInterface>[0]
	const service = createStablecoinsInterface(
		hub,
		getHydrationApi,
		getPeopleApi,
		{
			assetHub: true,
			hydration: true,
			people: true,
		},
	)
	const input = {
		from,
		to,
		symbol: 'DOT',
		feeAsset: 'DOT',
		amount: 10_000_000_000n,
		sender: 'sender',
		recipient: 'recipient',
	} as const
	const preparing = service.xcm!.prepare(input)
	await vi.waitFor(() => expect(getHydrationApi).toHaveBeenCalledOnce())
	expect(getPeopleApi).toHaveBeenCalledOnce()
	resolveHydration(hydration)
	await preparing
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		{ statemint: hub, hydration, 'people-polkadot': people },
		input,
	)
})

test('disconnecting during People initialization releases the client when it becomes ready', async () => {
	let resolve!: (api: PeopleApi) => void
	vi.spyOn(DedotClient, 'new').mockImplementation(
		() =>
			new Promise<PeopleApi>((done) => {
				resolve = done
			}) as ReturnType<typeof DedotClient.new>,
	)
	const disconnect = vi.fn()
	const service = createService()
	const connection = service.getPeopleApi()
	const closing = service.identityManager.disconnect()
	resolve({ disconnect } as unknown as PeopleApi)
	await Promise.all([connection, closing])
	expect(disconnect).toHaveBeenCalledOnce()
})
