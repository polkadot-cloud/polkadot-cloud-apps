// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ImportedAccount, StablecoinBalance } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
	resetStablecoinBalances,
	setStablecoinBalances,
	setStablecoinBalancesSyncing,
} from '../../global-bus/src/stablecoinBalances'
import { AllBalances } from '../../ui-modals/src/AccountBalances/AllBalances'
import { StablecoinMix } from '../../ui-modals/src/AccountBalances/StablecoinMix'

const { serviceApi } = vi.hoisted(() => ({
	serviceApi: {
		stablecoins: { query: { balances: vi.fn().mockResolvedValue(undefined) } },
	},
}))

vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ serviceApi }),
}))
vi.mock('../../hooks/src/index', async () => {
	const { useStablecoinBalances } = await import(
		'../../hooks/src/useStablecoinBalances'
	)
	return { useStablecoinBalances, useTokenPrices: () => ({ price: 2 }) }
})
vi.mock('../../app-swap/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-core/src/base', async () => {
	const { Loader } = await import('../../ui-core/src/base/Loader')
	return { Loader }
})
vi.mock('../../ui-core/src/popover', async () => ({
	...(await vi.importActual('../../ui-core/src/popover')),
	ConnectItem: {
		Container: ({ children }: { children: ReactNode }) =>
			createElement('div', null, children),
	},
}))

const account = { address: 'alice', source: 'extension' } as ImportedAccount
const balance = (
	chain: StablecoinBalance['chain'],
	symbol: StablecoinBalance['symbol'],
	units: number,
): StablecoinBalance => ({
	chain,
	symbol,
	free: BigInt(units) * 10n ** 6n,
	frozen: 0n,
	existentialDeposit: 0n,
	decimals: 6,
})
const hydrationBalances = [
	balance('hydration', 'DOT', 100),
	balance('hydration', 'USDC', 900),
	balance('hydration', 'USDT', 700),
	balance('hydration', 'HOLLAR', 400),
]
let root: Root
let container: HTMLDivElement
const render = async (balances: StablecoinBalance[]) => {
	const requestId = setStablecoinBalancesSyncing(account.address)
	setStablecoinBalances(account.address, balances, requestId)
	await act(async () => root.render(createElement(AllBalances, { account })))
}
const renderMix = () =>
	act(async () => root.render(createElement(StablecoinMix, { account })))

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	resetStablecoinBalances()
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	resetStablecoinBalances()
	vi.unstubAllGlobals()
})

test('balances and mix use only Polkadot Hub holdings even when Hydration balances are cached', async () => {
	await render([
		balance('statemint', 'DOT', 10),
		balance('statemint', 'USDC', 30),
		balance('statemint', 'USDT', 60),
		balance('statemint', 'dotUSD', 10),
		...hydrationBalances,
	])
	expect(container.textContent?.match(/\$120\.00/g)).toHaveLength(1)
	expect(container.textContent).toContain('Polkadot Hub')
	expect(container.textContent).not.toMatch(/Hydration|HOLLAR/)

	await renderMix()
	expect(
		container.querySelector('[role="img"]')?.getAttribute('aria-label'),
	).toBe('USDC: 30%, USDT: 60%, dotUSD: 10%')
	for (const value of ['30%', '60%', '10%']) {
		expect(container.textContent).toContain(value)
	}
	expect(container.textContent).not.toMatch(
		/Polkadot Hub|Hydration|HOLLAR|100%|\$/,
	)
})

test('Hydration-only holdings leave both views empty of value with zero mix percentages', async () => {
	await render(hydrationBalances)
	expect(container.textContent?.match(/\$0\.00/g)).toHaveLength(1)
	await renderMix()
	expect(
		container.querySelector('[role="img"]')?.getAttribute('aria-label'),
	).toBe('USDC: 0%, USDT: 0%, dotUSD: 0%')
	expect(container.textContent?.match(/0%/g)).toHaveLength(3)
	expect(container.textContent).not.toMatch(/Hydration|HOLLAR|NaN|100%|\$/)
})
