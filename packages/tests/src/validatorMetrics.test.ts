// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorOverviews } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { ValidatorMetrics } from '../../app-staking/src/canvas/ValidatorMetrics'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../../data-gate/src/index', () => ({ useValidatorOverviews: query }))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => true }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ activeEra: { index: 100 } }),
}))
vi.mock('../../hooks/src/useUi', () => ({ useUi: () => ({}) }))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../assets/src/index', () => ({
	getChainIcons: () => ({ token: () => null }),
}))
vi.mock('../../ui-overlay/src/index', () => ({
	CloseCanvas: () => null,
	useOverlay: () => ({
		canvas: {
			config: { options: { validator: 'validator', identity: 'Alice' } },
		},
	}),
}))
vi.mock('../../app-staking/node_modules/@w3ux/hooks/index.js', () => ({
	useSize: () => ({ width: 400, height: 250 }),
}))
vi.mock('../../app-staking/node_modules/@w3ux/react-polkicon/index.js', () => ({
	Polkicon: () => null,
}))
vi.mock('library/StatusLabel', () => ({ StatusLabel: () => null }))
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

beforeEach(() => vi.clearAllMocks())

const renderMetrics = () =>
	renderToStaticMarkup(createElement(ValidatorMetrics))
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')

test.each([
	{ loading: true, error: null, label: 'syncing' },
	{ loading: false, error: new Error('offline'), label: '—' },
])('unavailable metrics show $label without false zero stakes', (state) => {
	query.mockReturnValue({ ...state, data: undefined })
	const text = renderMetrics()
	expect(text).toContain(`selfStake: ${state.label}`)
	expect(text).toContain(`nominatorStake: ${state.label}`)
	expect(text).not.toContain('0 DOT')
	expect(query).toHaveBeenCalledWith(['validator'])
})

test.each([null, new Error('refresh failed')])(
	'loaded metrics retain stake through refresh errors: %s',
	(error) => {
		const data: ValidatorOverviews = new Map([
			[
				'validator',
				{
					own: 25000000000n,
					total: 125000000000n,
					nominatorCount: 1,
					pageCount: 1,
				},
			],
		])
		query.mockReturnValue({ data, loading: false, error })
		const text = renderMetrics()
		expect(text).toContain('selfStake: 2.5 DOT')
		expect(text).toContain('nominatorStake: 10 DOT')
	},
)

test('a completed snapshot without the validator has zero active-era stake', () => {
	query.mockReturnValue({ data: new Map(), loading: false, error: null })
	const text = renderMetrics()
	expect(text).toContain('selfStake: 0 DOT')
	expect(text).toContain('nominatorStake: 0 DOT')
})
