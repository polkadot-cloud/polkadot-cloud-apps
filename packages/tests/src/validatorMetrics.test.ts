// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { act, createElement, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import type { ValidatorOverviews } from 'types'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ValidatorMetrics } from '../../app-staking/src/canvas/ValidatorMetrics'
import { Metrics } from '../../app-staking/src/library/ListItem/Buttons/Metrics'
import { RowActionsMenu } from '../../app-staking/src/library/ValidatorList/RowActionsMenu'
import { formatFiatCurrency } from '../../locales/src/util/currency'
import { Menu } from '../../ui-app/src/Menu'

const { dom, query, selfStakeQuery, state, listeners, openCanvas } =
	await vi.hoisted(async () => {
		const { JSDOM } = await import('jsdom')
		const dom = new JSDOM('<!doctype html><html><body></body></html>')
		vi.stubGlobal('window', dom.window)
		vi.stubGlobal('document', dom.window.document)
		return {
			dom,
			query: vi.fn(),
			selfStakeQuery: vi.fn(),
			state: { api: true, price: 2 },
			listeners: new Set<() => void>(),
			openCanvas: vi.fn(),
		}
	})
vi.mock('library/Prompt/Confirm', () => ({ Confirm: () => null }))
vi.mock('../../global-bus/src/index', () => ({
	emitNotification: vi.fn(),
}))
vi.mock('../../hooks/src/useFavoriteValidators', () => ({
	useFavoriteValidators: () => ({ favorites: [] }),
}))
vi.mock('../../data-gate/src/index', () => ({
	useValidatorOverviews: query,
	useValidatorSelfStake: selfStakeQuery,
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useCurrency', () => ({
	useCurrency: () => ({ currency: 'GBP' }),
}))
vi.mock('../../hooks/src/useTokenPrices', () => ({
	useTokenPrices: () => ({ price: state.price }),
}))
vi.mock('../../hooks/src/usePlugins', () => {
	const subscribe = (listener: () => void) => {
		listeners.add(listener)
		return () => listeners.delete(listener)
	}
	const getSnapshot = () => state.api
	return {
		usePlugins: () => {
			const enabled = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
			return { pluginEnabled: () => enabled }
		},
	}
})
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ activeEra: { index: 100 } }),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../assets/src/index', () => ({
	getChainIcons: () => ({ token: () => null }),
}))
vi.mock('../../ui-overlay/src/index', () => ({
	CloseCanvas: () => null,
	usePrompt: () => ({}),
	useOverlay: () => ({
		canvas: {
			openCanvas,
			config: { options: { validator: 'validator', identity: 'Alice' } },
		},
	}),
}))
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/ui/polkicon/index.js',
	() => ({
		Polkicon: () => null,
	}),
)
vi.mock('library/StatusLabel', () => ({
	StatusLabel: ({ title }: { title: string }) => title,
}))
vi.mock(
	'library/Balance',
	() => import('../../app-staking/src/library/Balance'),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/EraPoints/ActiveGraph',
	() => ({ ActiveGraph: () => null }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/EraPoints/InactiveGraph',
	() => ({ InactiveGraph: () => null }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/Rewards/ActiveGraph',
	() => ({ ActiveGraph: () => null }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/Rewards/InactiveGraph',
	() => ({ InactiveGraph: () => null }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/ValidatorDiscovery',
	() => ({ ValidatorDiscovery: () => null }),
)
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

let root: ReturnType<typeof createRoot>
let container: HTMLDivElement

beforeEach(() => {
	vi.clearAllMocks()
	state.api = true
	state.price = 2
	selfStakeQuery.mockReturnValue({ data: undefined, loading: false })
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})

afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})
afterAll(() => dom.window.close())

const setApiEnabled = async (enabled: boolean) => {
	await act(async () => {
		state.api = enabled
		for (const listener of listeners) listener()
	})
}

const renderMetrics = async () => {
	await act(async () => root.render(createElement(ValidatorMetrics)))
	return Object.fromEntries(
		Array.from(container.querySelectorAll('h4'), (label) => {
			const stat = label.parentElement!
			return [
				label.textContent,
				{
					stake:
						stat.querySelector('.odometer')?.textContent ??
						stat.querySelector('span')?.textContent,
					fiat: stat.querySelector('h3')?.textContent,
				},
			]
		}),
	)
}

test.each([
	{ loading: true, error: null, label: 'syncing' },
	{ loading: false, error: new Error('offline'), label: '—' },
])(
	'unavailable metrics show $label without false zero stakes',
	async (state) => {
		query.mockReturnValue({ ...state, data: undefined })
		selfStakeQuery.mockReturnValue({ data: undefined, loading: state.loading })
		expect(await renderMetrics()).toEqual({
			selfStake: { stake: state.label, fiat: undefined },
			nominatorStake: { stake: state.label, fiat: undefined },
		})
		expect(query).toHaveBeenCalledWith(['validator'])
		expect(selfStakeQuery).toHaveBeenCalledWith('validator')
	},
)

test.each([null, new Error('refresh failed')])(
	'loaded metrics retain stake through refresh errors: %s',
	async (error) => {
		const data: ValidatorOverviews = new Map([
			[
				'validator',
				{
					own: 25000000000n,
					total: 125123450000n,
					nominatorCount: 1,
					pageCount: 1,
				},
			],
		])
		query.mockReturnValue({ data, loading: false, error })
		selfStakeQuery.mockReturnValue({
			data: 123456789123456789n,
			loading: false,
		})
		expect(await renderMetrics()).toEqual({
			selfStake: {
				stake: '12,345,678.9123456789',
				fiat: formatFiatCurrency(24_691_357.82, 'GBP'),
			},
			nominatorStake: {
				stake: '10.0123450000',
				fiat: formatFiatCurrency(20.02, 'GBP'),
			},
		})
	},
)

test('a waiting validator shows its ledger total and zero nominator stake without a price', async () => {
	query.mockReturnValue({ data: new Map(), loading: false, error: null })
	selfStakeQuery.mockReturnValue({ data: 35000000000n, loading: false })
	state.price = 0
	expect(await renderMetrics()).toEqual({
		selfStake: { stake: '3.50', fiat: '—' },
		nominatorStake: { stake: '0.00', fiat: '—' },
	})
})

test('a missing ledger is distinct from a zero ledger total', async () => {
	query.mockReturnValue({ data: new Map(), loading: false, error: null })
	selfStakeQuery.mockReturnValue({ data: null, loading: false })
	expect((await renderMetrics()).selfStake).toEqual({
		stake: '—',
		fiat: undefined,
	})

	selfStakeQuery.mockReturnValue({ data: 0n, loading: false })
	expect((await renderMetrics()).selfStake).toEqual({
		stake: '0.00',
		fiat: formatFiatCurrency(0, 'GBP'),
	})
})

test('disabling the API hides the metrics button while the canvas stays open', async () => {
	query.mockReturnValue({ data: new Map(), loading: false, error: null })
	await act(async () => {
		root.render([
			createElement(Metrics, {
				key: 'button',
				address: 'validator',
				display: 'Alice',
				wide: true,
			}),
			createElement(ValidatorMetrics, { key: 'canvas' }),
		])
	})
	const button = container.querySelector('button')!
	expect(button.textContent).toBe('metrics')
	await act(async () => button.click())
	expect(openCanvas).toHaveBeenCalledWith({
		key: 'ValidatorMetrics',
		options: { validator: 'validator', identity: 'Alice' },
		size: 'xl',
		variant: 'card',
	})
	expect(container.textContent).toContain('selfStake')

	await setApiEnabled(false)
	expect(container.querySelector('button')).toBeNull()
	expect(container.textContent).toContain('selfStake')
	expect(container.textContent).toContain('stakingApiDisabled')
})

test('an open row menu hides the metrics action when the API is disabled', async () => {
	await act(async () => {
		root.render([
			createElement(RowActionsMenu, {
				key: 'trigger',
				address: 'validator',
				display: 'Alice',
				showFavorite: false,
				showMetrics: true,
			}),
			createElement(Menu, { key: 'menu' }),
		])
	})
	await act(async () => container.querySelector('button')!.click())
	expect(container.textContent).toContain('metrics')

	await setApiEnabled(false)
	expect(container.textContent).not.toContain('metrics')
	expect(container.textContent).toContain('copyAddress')

	await setApiEnabled(true)
	const metricsButton = Array.from(container.querySelectorAll('button')).find(
		(button) => button.textContent === 'metrics',
	)
	await act(async () => metricsButton!.click())
	expect(openCanvas).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ variant: 'card' }),
	)
})
