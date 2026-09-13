// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorOverview } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { NominationListInner } from '../../app-staking/src/library/NominationList'
import type { ItemProps } from '../../app-staking/src/library/NominationList/types'

const { state, basic, detailed } = vi.hoisted(() => ({
	state: {
		network: 'polkadot',
		api: false,
		overviews: new Map<string, ValidatorOverview>(),
	},
	basic: vi.fn((_props: ItemProps) => null),
	detailed: vi.fn((_props: ItemProps) => null),
}))

vi.mock('../../data-gate/src/index', () => ({
	useValidatorOverviews: (_addresses: string[], enabled = true) => ({
		data: enabled ? state.overviews : undefined,
	}),
	useNomineeStatuses: () => ({}),
	useValidatorRewardRates: () => ({}),
}))
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: 'nominator' }),
	}),
)
vi.mock('contexts/List', () => ({
	useList: () => ({ listFormat: 'col' }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.api }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ activeEra: { index: 100 } }),
}))
vi.mock('../../hooks/src/useErasPerDay', () => ({
	useErasPerDay: () => ({ erasPerDay: 4 }),
}))
vi.mock('hooks/useRetainmentStatsEnabled', () => ({
	useRetainmentStatsEnabled: () => false,
}))
vi.mock(
	'hooks/useValidatorDetailsEnabled',
	() => import('../../app-staking/src/hooks/useValidatorDetailsEnabled'),
)
vi.mock('../../hooks/src/useValidatorWarnings', () => ({
	useValidatorWarnings: () => ({ warnings: {} }),
}))
vi.mock('library/List/useForceCardLayout', () => ({
	useForceCardLayout: () => false,
}))
vi.mock('library/List/Utils', () => ({ EMPTY_ERA_POINTS: [] }))
vi.mock('library/List', () => import('../../app-staking/src/library/List'))
vi.mock('library/List/MotionContainer', () => ({
	MotionContainer: 'div',
	MotionItem: 'div',
}))
vi.mock('../../ui-app/src/ListItem', () => ({
	ListItem: { FormatToggle: () => null },
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({ modal: {} }),
}))
vi.mock('../../plugin-staking-api/src/index', () => ({
	fetchValidatorDetailsBatch: vi.fn(),
}))
vi.mock('../../app-staking/src/library/NominationList/BasicItem', () => ({
	BasicItem: basic,
}))
vi.mock('../../app-staking/src/library/NominationList/DetailedItem', () => ({
	DetailedItem: detailed,
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({ useTranslation: () => ({ t: (key: string) => key }) }),
)

beforeEach(() => {
	vi.clearAllMocks()
	state.overviews = new Map([
		['active', { own: 10n, total: 100n, nominatorCount: 1, pageCount: 1 }],
	])
})

test.each([
	['polkadot', false, false],
	['kusama', false, false],
	['paseo', true, false],
	['polkadot', true, true],
	['kusama', true, true],
] as const)(
	'%s API=%s supplies overviews to nomination rows with details=%s',
	(network, api, detailsEnabled) => {
		state.network = network
		state.api = api
		renderToStaticMarkup(
			createElement(NominationListInner, {
				validators: [
					{ address: 'active', prefs: null },
					{ address: 'waiting', prefs: null },
				],
				bondFor: 'nominator',
			}),
		)
		const rows = detailsEnabled ? detailed : basic
		expect(rows).toHaveBeenCalledTimes(2)
		expect(detailsEnabled ? basic : detailed).not.toHaveBeenCalled()
		const validators = rows.mock.calls.map(([{ validator }]) => validator)
		expect(validators[0]).toMatchObject({
			validatorStatus: 'active',
			overview: { total: 100n },
		})
		expect(validators[1]).toMatchObject({
			validatorStatus: 'waiting',
			overview: null,
		})
	},
)
