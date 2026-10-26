// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getUid } from '../../global-bus/src/txSubmit'
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
} = vi.hoisted(() => ({
	state: { source: 'ledger' },
	signLedgerPayload: vi.fn(),
	handleErrors: vi.fn(),
	addSend: vi.fn(),
	addSignAndSend: vi.fn(),
	extraSignedExtension: vi.fn(),
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
	emitNotification: vi.fn(),
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
