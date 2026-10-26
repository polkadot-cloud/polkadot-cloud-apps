// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { TxFailure, TxStatusHandlers } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getUid, handleResult } from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'
import type { SubmittableExtrinsic } from '../../tx-submit/node_modules/dedot/index.js'
import type {
	UseSubmitExtrinsic,
	UseSubmitExtrinsicProps,
} from '../../tx-submit/src/types'
import { useSubmitExtrinsic } from '../../tx-submit/src/useSubmitExtrinsic'
import { getSigningNetworkInfo } from '../../tx-submit/src/util'

const {
	state,
	signLedgerPayload,
	handleErrors,
	addSend,
	addSignAndSend,
	extraSignedExtension,
	emitNotification,
} = vi.hoisted(() => ({
	state: { source: 'ledger' },
	signLedgerPayload: vi.fn(),
	handleErrors: vi.fn(),
	addSend: vi.fn(),
	addSignAndSend: vi.fn(),
	extraSignedExtension: vi.fn(),
	emitNotification: vi.fn(),
}))

vi.mock(
	'../../tx-submit/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useExtensionAccounts: () => ({
			getExtensionAccount: () => ({ signer: {} }),
		}),
		useExtensions: () => ({ extensionsStatus: { wallet: 'connected' } }),
		useImportedAccounts: () => ({
			getAccount: () => ({ address: 'alice', source: state.source, index: 0 }),
			requiresManualSign: () => state.source === 'ledger',
		}),
	}),
)
vi.mock(
	'../../tx-submit/node_modules/@polkadot-cloud/connect-ledger/index.js',
	() => ({
		signLedgerPayload,
		useLedger: () => ({ handleErrors, handleResetLedgerTask: vi.fn() }),
	}),
)
vi.mock('../../tx-submit/node_modules/dedot/codecs/index.js', async () => ({
	...(await vi.importActual(
		'../../tx-submit/node_modules/dedot/codecs/index.js',
	)),
	$Metadata: { tryEncode: () => new Uint8Array([1]) },
}))
vi.mock('../../global-bus/src/index', async () => ({
	...(await vi.importActual('../../global-bus/src/index')),
	addSend,
	addSignAndSend,
	emitNotification,
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({
		serviceApi: {
			codec: { $Signature: () => ({ tryDecode: () => 'decoded-signature' }) },
			signer: { extraSignedExtension },
		},
	}),
}))
vi.mock('../../hooks/src/useAccountBalances', () => ({
	useAccountBalances: () => ({ balances: { balanceTxFees: 1_000_000n } }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useProxySupported', () => ({
	useProxySupported: () => ({ isProxySupported: () => false }),
}))
vi.mock('../../ui-overlay/src/index', () => ({ usePrompt: () => ({}) }))
vi.mock('../../tx-submit/src/QRSignPrompt', () => ({
	QRSignPrompt: () => null,
}))
vi.mock('../../tx-submit/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))

let root: Root
let container: HTMLDivElement
let submission: UseSubmitExtrinsic
const properties = vi.fn()
const tx = {
	client: {
		chainSpec: { properties },
		runtimeVersion: { specName: 'asset-hub-polkadot' },
		metadata: {},
		query: { system: { account: async () => ({ nonce: 0 }) } },
	},
	call: { pallet: 'AssetConversion', palletCall: { name: 'Swap' } },
	toHex: () => '0x01',
} as unknown as SubmittableExtrinsic
const Probe = (props: UseSubmitExtrinsicProps) => {
	submission = useSubmitExtrinsic(props)
	return null
}
const render = (props: Partial<UseSubmitExtrinsicProps> = {}) =>
	act(async () =>
		root.render(
			createElement(Probe, {
				tx,
				from: { address: 'alice', source: state.source },
				shouldSubmit: true,
				estimatedFee: 100n,
				...props,
			}),
		),
	)

beforeEach(() => {
	vi.resetAllMocks()
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	_uids.next([])
	state.source = 'ledger'
	properties.mockResolvedValue({ tokenSymbol: ['DOT'], tokenDecimals: [10] })
	signLedgerPayload.mockResolvedValue({ signature: '0x01', data: [] })
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	_uids.next([])
	delete window.injectedWeb3
	vi.unstubAllGlobals()
})

test.each(['USDT', 'dotUSD', 'DOT'])(
	'Ledger proofs use native DOT properties while keeping %s fee payment options',
	async (feeAsset) => {
		const feePaymentOptions =
			feeAsset === 'DOT'
				? undefined
				: { assetId: feeAsset === 'USDT' ? 1984 : 7873 }
		await render({
			feePaymentOptions,
			feeDisplay: { unit: feeAsset, units: feeAsset === 'DOT' ? 10 : 6 },
		})
		await act(async () => submission.onSubmit())

		expect(signLedgerPayload).toHaveBeenCalledExactlyOnceWith(
			'asset-hub-polkadot',
			'alice',
			extraSignedExtension,
			tx,
			'0x01',
			{ decimals: 10, tokenSymbol: 'DOT' },
			0,
			feePaymentOptions,
		)
		expect(addSend).toHaveBeenCalledOnce()
	},
)

test('signing properties come from the transaction chain even when the active network differs', async () => {
	properties.mockResolvedValue({ tokenSymbol: 'HDX', tokenDecimals: 12 })
	await render({ feeDisplay: { unit: 'USDT', units: 6 } })
	await act(async () => submission.onSubmit())

	expect(signLedgerPayload.mock.calls[0][5]).toEqual({
		decimals: 12,
		tokenSymbol: 'HDX',
	})
})

test('missing native properties stop Ledger signing instead of falling back to the fee token', async () => {
	properties.mockResolvedValue({})
	await render({ feeDisplay: { unit: 'USDT', units: 6 } })
	await act(async () => submission.onSubmit())

	expect(signLedgerPayload).not.toHaveBeenCalled()
	expect(addSend).not.toHaveBeenCalled()
	expect(handleErrors).toHaveBeenCalledWith(expect.any(Error))
	expect(getUid(submission.uid)?.submitted).toBe(false)
})

test('extension signing keeps the fee payment options without querying Ledger properties', async () => {
	state.source = 'wallet'
	window.injectedWeb3 = {
		wallet: {
			id: 'wallet',
			title: 'Test wallet',
			icon: () => null,
			url: '',
			enable: vi.fn(),
		},
	}
	const feePaymentOptions = { assetId: 1984 }
	await render({ feePaymentOptions, feeDisplay: { unit: 'USDT', units: 6 } })
	await act(async () => submission.onSubmit())

	expect(properties).not.toHaveBeenCalled()
	expect(signLedgerPayload).not.toHaveBeenCalled()
	expect(addSignAndSend).toHaveBeenCalledOnce()
	expect(addSignAndSend.mock.calls[0][7]).toBe(feePaymentOptions)
})

test.each(['ledger', 'wallet'])(
	'%s can repeat submissions after finalization or failure without remounting',
	async (source) => {
		state.source = source
		window.injectedWeb3 = {
			wallet: {
				id: 'wallet',
				title: 'Test wallet',
				icon: () => null,
				url: '',
				enable: vi.fn(),
			},
		}
		const callbackSubmit = vi.fn()
		const callbackInBlock = vi.fn()
		await render({ callbackSubmit, callbackInBlock })
		const nextAttempt = async () => {
			await act(async () => submission.onSubmit())
			const calls = source === 'ledger' ? addSend : addSignAndSend
			const call = calls.mock.calls.at(-1)!
			return {
				uid: call[1] as number,
				handlers: call[source === 'ledger' ? 4 : 6] as TxStatusHandlers,
			}
		}
		const block = { blockHash: '0x01' as const, blockNumber: 1, txIndex: 0 }
		const failure: TxFailure = {
			type: 'dispatch',
			error: { type: 'Token', value: 'Frozen' },
		}

		// Keep the hook and transaction props mounted through each terminal result.
		for (const outcome of ['finalized', 'invalid', 'dispatch'] as const) {
			const attempt = await nextAttempt()
			expect(getUid(attempt.uid)?.submitted).toBe(true)
			await act(async () => {
				handleResult(attempt.uid, { type: 'Broadcasting' }, attempt.handlers)
			})
			expect(getUid(attempt.uid)?.pending).toBe(true)
			await act(async () => {
				if (outcome === 'invalid') {
					handleResult(
						attempt.uid,
						{ type: 'Invalid', value: { error: 'Rejected' } },
						attempt.handlers,
					)
				} else {
					handleResult(
						attempt.uid,
						{ type: 'BestChainBlockIncluded', value: block },
						attempt.handlers,
						outcome === 'dispatch' ? failure : undefined,
					)
					if (outcome === 'finalized') {
						handleResult(
							attempt.uid,
							{ type: 'Finalized', value: block },
							attempt.handlers,
						)
					}
				}
			})
			expect(getUid(attempt.uid)).toBeUndefined()
			expect(submission.uid).toBeGreaterThan(attempt.uid)
			expect(getUid(submission.uid)).toMatchObject({
				submitted: false,
				pending: false,
				fee: 100n,
			})

			// A late callback from this attempt must not report success or affect the next one.
			const notificationCount = emitNotification.mock.calls.length
			handleResult(
				attempt.uid,
				{ type: 'Finalized', value: block },
				attempt.handlers,
			)
			expect(emitNotification).toHaveBeenCalledTimes(notificationCount)
		}

		const repeated = await nextAttempt()
		await act(async () => {
			handleResult(repeated.uid, { type: 'Broadcasting' }, repeated.handlers)
			handleResult(
				repeated.uid,
				{ type: 'BestChainBlockIncluded', value: block },
				repeated.handlers,
			)
			handleResult(
				repeated.uid,
				{ type: 'Finalized', value: block },
				repeated.handlers,
			)
		})
		expect(callbackSubmit).toHaveBeenCalledTimes(4)
		expect(callbackInBlock).toHaveBeenCalledTimes(2)
		expect(emitNotification.mock.calls.map(([notice]) => notice.title)).toEqual(
			[
				'pending',
				'inBlock',
				'finalized',
				'pending',
				'failed',
				'pending',
				'failed',
				'pending',
				'inBlock',
				'finalized',
			],
		)
	},
)

test.each(['finalized', 'dropped'] as const)(
	'an older %s transfer cannot reset a newer submission',
	async (outcome) => {
		const callbackInBlock = vi.fn()
		await render({ tag: 'stablecoin-send', callbackInBlock })
		await act(async () => submission.onSubmit())
		const firstUid = addSend.mock.calls[0][1] as number
		const firstHandlers = addSend.mock.calls[0][4] as TxStatusHandlers
		const block = { blockHash: '0x01' as const, blockNumber: 1, txIndex: 0 }
		await act(async () => {
			handleResult(firstUid, { type: 'Broadcasting' }, firstHandlers)
			handleResult(
				firstUid,
				{ type: 'BestChainBlockIncluded', value: block },
				firstHandlers,
			)
		})

		expect(submission.uid).not.toBe(firstUid)
		expect(getUid(firstUid)).toBeDefined()
		await act(async () => submission.onSubmit())
		const secondUid = addSend.mock.calls[1][1] as number
		const secondHandlers = addSend.mock.calls[1][4] as TxStatusHandlers
		await act(async () => {
			handleResult(
				firstUid,
				outcome === 'finalized'
					? { type: 'Finalized', value: block }
					: { type: 'Drop', value: { error: 'Finality timeout' } },
				firstHandlers,
			)
		})
		expect(submission.uid).toBe(secondUid)
		expect(getUid(secondUid)?.submitted).toBe(true)
		await act(async () => {
			handleResult(secondUid, { type: 'Broadcasting' }, secondHandlers)
			handleResult(
				secondUid,
				{ type: 'BestChainBlockIncluded', value: block },
				secondHandlers,
			)
			handleResult(
				secondUid,
				{ type: 'Finalized', value: block },
				secondHandlers,
			)
		})
		expect(callbackInBlock).toHaveBeenCalledTimes(2)
		expect(
			emitNotification.mock.calls.filter(
				([notice]) => notice.title === 'finalized',
			),
		).toHaveLength(outcome === 'finalized' ? 2 : 1)
		expect(getUid(firstUid)).toBeUndefined()
		expect(getUid(secondUid)).toBeUndefined()
	},
)

test('StrictMode creates only one draft submission', async () => {
	await act(async () =>
		root.render(
			createElement(
				StrictMode,
				null,
				createElement(Probe, {
					tx,
					from: { address: 'alice', source: 'ledger' },
					shouldSubmit: true,
					estimatedFee: 100n,
				}),
			),
		),
	)
	expect(_uids.getValue()).toHaveLength(1)
	expect(getUid(submission.uid)?.fee).toBe(100n)
})

test.each([
	{},
	{ tokenSymbol: 'DOT' },
	{ tokenDecimals: 10 },
	{ tokenSymbol: [], tokenDecimals: [] },
	{ tokenSymbol: ' ', tokenDecimals: 10 },
	{ tokenSymbol: 'DOT', tokenDecimals: -1 },
	{ tokenSymbol: 'DOT', tokenDecimals: 256 },
	{ tokenSymbol: 'DOT', tokenDecimals: 1.5 },
])('rejects invalid native currency properties: %j', async (value) => {
	properties.mockResolvedValue(value)
	await expect(getSigningNetworkInfo(tx.client)).rejects.toThrow(
		'Missing or invalid native currency properties',
	)
})
