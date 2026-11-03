// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { CrossChainTransferInput, StablecoinBalance } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Bridge } from '../../app-swap/src/pages/Bridge'
import { encodeAddress } from '../../dedot-api/node_modules/dedot/utils'

const mocked = vi.hoisted(() => ({
	refresh: vi.fn(),
	prepare: vi.fn(),
}))
const account = {
	address: encodeAddress(new Uint8Array(32).fill(1)),
	source: 'extension',
}
const balance: StablecoinBalance = {
	chain: 'statemint',
	symbol: 'DOT',
	free: 50_000_000_000n,
	frozen: 0n,
	existentialDeposit: 100_000_000n,
	decimals: 10,
}
vi.mock('../../hooks/src/index', () => ({
	useApi: () => ({ serviceApi: {} }),
	useTxMeta: () => ({ getTxSubmission: () => undefined }),
	useStablecoinBalances: () => ({
		balances: [balance],
		loading: false,
		refresh: mocked.refresh,
		getBalance: (chain: string, symbol: string) =>
			chain === balance.chain && symbol === balance.symbol
				? balance
				: undefined,
	}),
}))
vi.mock('../../app-swap/src/pages/Send/hooks/useSendAccounts', () => ({
	useSendAccounts: () => ({
		fromAccount: account,
		accounts: [account],
		accountsWithSigners: [account],
	}),
}))
vi.mock('../../app-swap/src/pages/Send/hooks/useHydrationFeeSetup', () => ({
	useHydrationFeeSetup: () => ({ ready: true, submission: {} }),
}))
vi.mock('../../app-swap/src/pages/Bridge/useCrossChainTransfer', () => ({
	useCrossChainTransfer: (...args: unknown[]) => mocked.prepare(...args),
}))
vi.mock('../../app-swap/src/pages/Bridge/TransferAction', () => ({
	TransferAction: () => null,
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountDropdown: () => null,
}))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-app/src/EstimatedTxFee', () => ({
	EstimatedTxFee: () => null,
}))
vi.mock('../../ui-core/src/base', async () => {
	const { Row } = await import('../../ui-core/src/base/Page/Row')
	return { Page: { Row } }
})
vi.mock('../../ui-core/src/input', async () => {
	const { SendForm } = await import('../../ui-core/src/input/SendForm')
	return { SendForm }
})
vi.mock('../../app-swap/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))

let root: Root
let container: HTMLDivElement
const click = (button: HTMLButtonElement) => act(async () => button.click())
const selectDot = async (dropdown: number) => {
	await click(
		container.querySelectorAll<HTMLButtonElement>('[aria-expanded]')[dropdown],
	)
	await click(
		[...container.querySelectorAll('button')].find(
			(button) => button.textContent === 'DOT',
		)!,
	)
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	mocked.prepare.mockImplementation((input: CrossChainTransferInput) => ({
		quote: {
			originFee: { amount: 1_000_000n, symbol: 'DOT', decimals: 10 },
			originFeeFromAmount:
				input.from === 'statemint' && input.feeAsset === input.symbol,
			destinationFee: { amount: 1_000_000n, symbol: 'DOT', decimals: 10 },
			receivedAmount: 9_980_000_001n,
		},
		networkFee: 2_000_000n,
	}))
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})

test('DOT selection preserves ten-decimal amounts, formats received DOT, and max-fills after fees and minimum balance', async () => {
	await act(async () => root.render(createElement(Bridge)))
	await selectDot(2)
	await selectDot(3)
	expect(container.textContent).toContain('0.9980000001 DOT')
	expect(container.textContent).toContain('4.98978 DOT')
	const amount = container.querySelector<HTMLInputElement>(
		'[aria-label="amountToSend"]',
	)!
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value',
		)!.set!.call(amount, '1.2345678901')
		amount.dispatchEvent(new Event('input', { bubbles: true }))
	})
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ symbol: 'DOT', amount: 12_345_678_901n }),
		true,
	)
	await click(
		[...container.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('4.98978 DOT'),
		)!,
	)
	expect(amount.value).toBe('4.98978')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ symbol: 'DOT', amount: 49_897_800_000n }),
		true,
	)
})
