// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Tooltip } from 'radix-ui'
import { act, createElement, type ReactNode, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import type { ValidatorOverviews } from 'types'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ValidatorMetrics } from '../../app-staking/src/canvas/ValidatorMetrics'
import { Metrics } from '../../app-staking/src/library/ListItem/Buttons/Metrics'
import { RowActionsMenu } from '../../app-staking/src/library/ValidatorList/RowActionsMenu'
import { formatFiatCurrency } from '../../locales/src/util/currency'
import { Menu } from '../../ui-app/src/Menu'

const {
	dom,
	query,
	selfStakeQuery,
	totalBackingQuery,
	backingHistoryQuery,
	drawBackingChart,
	state,
	listeners,
	openCanvas,
} = await vi.hoisted(async () => {
	const { JSDOM } = await import('jsdom')
	const dom = new JSDOM('<!doctype html><html><body></body></html>', {
		pretendToBeVisual: true,
	})
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	return {
		dom,
		query: vi.fn(),
		selfStakeQuery: vi.fn(),
		totalBackingQuery: vi.fn(),
		backingHistoryQuery: vi.fn(),
		drawBackingChart: vi.fn((_props: unknown) => 'BackingHistoryChart'),
		state: {
			api: true,
			network: 'polkadot',
			price: 2,
			validator: 'validator',
			identity: 'Alice' as ReactNode,
		},
		listeners: new Set<() => void>(),
		openCanvas: vi.fn(),
	}
})
vi.mock('library/Prompt/Confirm', () => ({ Confirm: () => null }))
vi.mock(
	'library/Announcements/AnnouncementsList',
	() => import('../../app-staking/src/library/Announcements/AnnouncementsList'),
)
vi.mock(
	'library/Loader/Announcement',
	() => import('../../app-staking/src/library/Loader/Announcement'),
)
vi.mock('../../global-bus/src/index', () => ({
	emitNotification: vi.fn(),
}))
vi.mock('../../hooks/src/useFavoriteValidators', () => ({
	useFavoriteValidators: () => ({ favorites: [] }),
}))
vi.mock('../../data-gate/src/index', () => ({
	useValidatorOverviews: query,
	useValidatorSelfStake: selfStakeQuery,
	useValidatorTotalBacking: totalBackingQuery,
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
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
			config: {
				options: { validator: state.validator, identity: state.identity },
			},
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
	'library/ListItem/Buttons/CopyAddress',
	() => import('../../app-staking/src/library/ListItem/Buttons/CopyAddress'),
)
vi.mock('../../plugin-staking-api/src/index', () => ({
	useValidatorBackingHistory: backingHistoryQuery,
}))
vi.mock('../../ui-graphs/src/index', () => ({
	ValidatorBackingLine: drawBackingChart,
}))
vi.mock('../../hooks/src/useThemeValues', () => ({
	useThemeValues: () => ({ getThemeValue: (key: string) => key }),
}))
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/EraPoints/ActiveGraph',
	() => ({ ActiveGraph: () => 'EraPointsActiveGraph' }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/EraPoints/InactiveGraph',
	() => ({ InactiveGraph: () => 'EraPointsInactiveGraph' }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/Rewards/ActiveGraph',
	() => ({ ActiveGraph: () => 'RewardsActiveGraph' }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/Rewards/InactiveGraph',
	() => ({ InactiveGraph: () => 'RewardsInactiveGraph' }),
)
vi.mock(
	'../../app-staking/src/canvas/ValidatorMetrics/ValidatorDiscovery',
	() => ({ ValidatorDiscovery: () => null }),
)
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { resolvedLanguage: 'en' },
		}),
	}),
)

let root: ReturnType<typeof createRoot>
let container: HTMLDivElement

beforeEach(() => {
	vi.clearAllMocks()
	backingHistoryQuery.mockReturnValue({
		data: {
			validatorBackingHistory: [
				{ era: 97, totalBacking: null, nominatorCount: null },
				{ era: 98, totalBacking: '0', nominatorCount: 0 },
				{ era: 99, totalBacking: '25000000000', nominatorCount: 12 },
			],
		},
		loading: false,
	})
	state.api = true
	state.network = 'polkadot'
	state.price = 2
	state.validator = 'validator'
	state.identity = 'Alice'
	query.mockReturnValue({ data: undefined, loading: false })
	selfStakeQuery.mockReturnValue({ data: undefined, loading: false })
	totalBackingQuery.mockReturnValue({ data: null, loading: false })
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.stubGlobal('window', dom.window)
	vi.stubGlobal('document', dom.window.document)
	vi.stubGlobal('open', dom.window.open)
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

const metricsCanvas = () =>
	createElement(
		Tooltip.Provider,
		{ key: 'canvas' },
		createElement(ValidatorMetrics),
	)

const renderMetrics = async () => {
	await act(async () => root.render(metricsCanvas()))
	const overview = Array.from(container.querySelectorAll('h3')).find(
		(heading) => heading.textContent === 'backingOverview',
	)!.parentElement!
	return Object.fromEntries(
		Array.from(overview.querySelectorAll('h4'), (label) => {
			const stat = label.parentElement!
			return [
				label.textContent,
				{
					stake:
						stat.querySelector('.odometer')?.textContent ??
						stat.querySelector('h1')?.textContent ??
						stat.querySelector('span')?.textContent,
					fiat: stat.querySelector('h3')?.textContent,
				},
			]
		}),
	)
}

const address = '5GrwvaEF5zXb26Fz9rcQpDWS9rLLK46TzRxFxt2apDudsKjU'
const shortAddress = '5Grwva...udsKjU'

test.each([undefined, null, '  '])(
	'uses the truncated address when the display name is %s',
	async (identity) => {
		state.validator = address
		state.identity = identity
		await renderMetrics()
		expect(container.querySelector('h1')?.textContent).toBe(shortAddress)
		expect(container.querySelector('h2')?.textContent).toBe(shortAddress)
	},
)

test('shows the display name and copies the full address from the subtitle', async () => {
	state.validator = address
	state.identity = createElement('span', null, 'Alice')
	const writeText = vi.fn().mockResolvedValue(undefined)
	vi.stubGlobal('navigator', { clipboard: { writeText } })
	await renderMetrics()
	expect(container.querySelector('h1')?.textContent).toBe('Alice')
	const subtitle = container.querySelector('h2')!
	expect(subtitle.textContent).toBe(shortAddress)
	const copyButton = subtitle.querySelector<HTMLButtonElement>(
		'button[aria-label="copyAddress"]',
	)!
	await act(async () => copyButton.click())
	expect(writeText).toHaveBeenCalledExactlyOnceWith(address)
})

test('shows the full address when the subtitle address receives focus', async () => {
	state.validator = address
	vi.stubGlobal('CustomEvent', dom.window.CustomEvent)
	vi.stubGlobal('Element', dom.window.Element)
	vi.stubGlobal('HTMLElement', dom.window.HTMLElement)
	vi.stubGlobal('Node', dom.window.Node)
	vi.stubGlobal('getComputedStyle', dom.window.getComputedStyle)
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	)
	await renderMetrics()
	const trigger = container.querySelector<HTMLElement>('h2 [tabindex="0"]')!
	await act(async () => trigger.focus())
	expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(address)
})

test('omits the address subtitle when there is no address', async () => {
	state.validator = ''
	await renderMetrics()
	expect(container.querySelector('h1')?.textContent).toBe('Alice')
	expect(container.querySelector('header h2')).toBeNull()
})

test.each([
	{ loading: true, error: null, label: 'syncing' },
	{ loading: false, error: new Error('offline'), label: '—' },
])(
	'unavailable metrics show $label without false zero stakes',
	async (state) => {
		query.mockReturnValue({ ...state, data: undefined })
		selfStakeQuery.mockReturnValue({ data: undefined, loading: state.loading })
		totalBackingQuery.mockReturnValue({ data: null, loading: state.loading })
		expect(await renderMetrics()).toEqual({
			selfStake: { stake: state.label, fiat: undefined },
			totalBacking: { stake: state.label, fiat: undefined },
			activeBacking: { stake: state.label, fiat: undefined },
		})
		expect(query).toHaveBeenCalledWith(['validator'])
		expect(selfStakeQuery).toHaveBeenCalledWith('validator')
		expect(totalBackingQuery).toHaveBeenCalledWith('validator')
	},
)

test.each([null, new Error('refresh failed')])(
	'loaded metrics retain compact stake and exact fiat values through refresh errors: %s',
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
		totalBackingQuery.mockReturnValue({ data: 54012345000000n, loading: false })
		const metrics = await renderMetrics()
		expect(Object.keys(metrics)).toEqual([
			'selfStake',
			'totalBacking',
			'activeBacking',
		])
		expect(metrics).toEqual({
			selfStake: {
				stake: '12.3M',
				fiat: formatFiatCurrency(24_691_357.82, 'GBP'),
			},
			totalBacking: {
				stake: '5.4K',
				fiat: formatFiatCurrency(10_802.47, 'GBP'),
			},
			activeBacking: {
				stake: '10.0123450000',
				fiat: formatFiatCurrency(20.02, 'GBP'),
			},
		})
	},
)

test('a waiting validator shows its ledger total and zero active backing without a price', async () => {
	query.mockReturnValue({ data: new Map(), loading: false, error: null })
	selfStakeQuery.mockReturnValue({ data: 35000000000n, loading: false })
	totalBackingQuery.mockReturnValue({ data: 52000000000n, loading: false })
	state.price = 0
	expect(await renderMetrics()).toEqual({
		selfStake: { stake: '3.50', fiat: '—' },
		totalBacking: { stake: '5.20', fiat: '—' },
		activeBacking: { stake: '0.00', fiat: '—' },
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

test('the chart uses the last completed era and preserves gaps and zero backing', async () => {
	await renderMetrics()
	expect(backingHistoryQuery).toHaveBeenCalledWith({
		network: 'polkadot',
		validator: 'validator',
		toEra: 99,
	})
	expect(drawBackingChart.mock.lastCall?.[0]).toMatchObject({
		unit: 'DOT',
		entries: [
			{ era: 97, backing: null, nominators: null },
			{ era: 98, backing: 0, nominators: 0 },
			{ era: 99, backing: 2.5, nominators: 12 },
		],
	})
})

test('Kusama skips the backing history chart and query', async () => {
	state.network = 'kusama'
	await renderMetrics()
	expect(backingHistoryQuery).not.toHaveBeenCalled()
	expect(container.textContent).not.toContain('backingHistory')
	expect(container.textContent).not.toContain('totalNominators')
	expect(container.textContent).toContain('RewardsActiveGraph')
})

test.each([
	{
		count: 1234,
		value: '1,234',
		backing: 234567891234567891n,
		amount: '23,456,789.1234567891 DOT',
	},
	{ count: 0, value: '0', backing: 0n, amount: '0 DOT' },
	{
		count: null,
		value: 'notAvailable',
		backing: 1n,
		amount: '0.0000000001 DOT',
	},
	{ count: 1, value: '1', backing: null, amount: 'notAvailable' },
])(
	'shows the latest nominator count and full backing ($amount) above operator details',
	async ({ count, value, backing, amount }) => {
		totalBackingQuery.mockReturnValue({ data: backing, loading: false })
		backingHistoryQuery.mockReturnValue({
			data: {
				validatorBackingHistory: [
					{ era: 98, totalBacking: '0', nominatorCount: count },
					{ era: 99, totalBacking: null, nominatorCount: null },
				],
			},
			loading: false,
		})
		await renderMetrics()
		const history = Array.from(container.querySelectorAll('section')).find(
			(section) =>
				section.querySelector('h3')?.textContent === 'backingHistory',
		)!
		const stats = history.nextElementSibling!
		expect(
			Array.from(stats.querySelectorAll('h4'), (el) => el.textContent),
		).toEqual(['totalNominators', 'totalBacking'])
		expect(
			Array.from(stats.querySelectorAll('h2'), (el) => el.textContent),
		).toEqual([value, amount])
		expect(stats.nextElementSibling?.querySelector('h3')?.textContent).toBe(
			'operatorDetails',
		)
	},
)

test('disabling the API hides the metrics button while the canvas stays open', async () => {
	await act(async () => {
		root.render([
			createElement(Metrics, {
				key: 'button',
				address: 'validator',
				display: 'Alice',
				wide: true,
			}),
			metricsCanvas(),
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
	const sections = container.querySelectorAll('section')
	expect(sections[0].textContent).toContain('EraPointsActiveGraph')
	expect(sections[1].textContent).toContain('RewardsActiveGraph')
	expect(sections[2].textContent).toContain('BackingHistoryChart')
	await setApiEnabled(false)
	expect(
		container.querySelector('button[aria-label="copyAddress"]'),
	).not.toBeNull()
	expect(container.textContent).not.toContain('metrics')
	expect(container.textContent).toContain('selfStake')
	expect(container.textContent).toContain('stakingApiDisabled')
	expect(sections[0].textContent).toContain('EraPointsInactiveGraph')
	expect(sections[1].textContent).toContain('RewardsInactiveGraph')
	expect(container.textContent).not.toContain('BackingHistoryChart')
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
