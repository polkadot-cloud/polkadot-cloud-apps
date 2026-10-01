// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { MenuControls } from '../../app-staking/src/library/GenerateNominations/Controls/MenuControls'
import { NominationsView } from '../../app-staking/src/library/GenerateNominations/NominationsView'
import type {
	FilterHandler,
	NominationsViewProps,
} from '../../app-staking/src/library/GenerateNominations/types'

const { state } = vi.hoisted(() => ({
	state: { fetching: false, method: 'Optimal Selection' as string | null },
}))
vi.mock('contexts/ManageNominations', () => ({
	useManageNominations: () => ({
		...state,
		nominations: [{ address: 'validator', prefs: null }],
		defaultNominations: [],
	}),
}))
vi.mock('contexts/List', () => import('../../app-staking/src/contexts/List'))
vi.mock(
	'library/Prompt/Confirm',
	() => import('../../app-staking/src/library/Prompt/Confirm'),
)
vi.mock('pages/Nominate/Wrappers', () => ({ Subheading: 'div' }))
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: 'nominator' }),
		useImportedAccounts: () => ({
			accountsInitialised: true,
			isReadOnlyAccount: () => false,
		}),
	}),
)
vi.mock('../../hooks/src/useApi', () => ({ useApi: () => ({ isReady: true }) }))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useTheme', () => ({
	useTheme: () => ({ themeElementRef: { current: null } }),
}))
vi.mock('../../data-gate/src/index', () => ({
	useValidatorOverviews: () => ({ data: undefined }),
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({ modal: {} }),
}))
vi.mock('hooks/useNominationHealth', () => ({
	useNominationHealth: () => ({ active: false }),
}))
vi.mock('hooks/useValidatorDetailsEnabled', () => ({
	useValidatorDetailsEnabled: () => false,
}))
vi.mock('../../hooks/src/useValidatorWarnings', () => ({
	useValidatorWarnings: () => ({ warnings: {} }),
}))
vi.mock('library/ValidatorList/useValidatorDetails', () => ({
	useValidatorDetails: () => ({ isLoading: false }),
}))
vi.mock('library/ValidatorList', () => ({
	ValidatorListInner: ({ BeforeListNode }: { BeforeListNode: ReactNode }) =>
		createElement('section', { 'data-validator-list': true }, BeforeListNode),
}))
vi.mock('../../app-staking/src/library/GenerateNominations/Methods', () => ({
	Methods: () => 'method-selection',
}))
vi.mock(
	'../../app-staking/src/library/GenerateNominations/NominationHealth',
	() => ({ NominationHealth: () => null }),
)
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

const handler = (
	group: FilterHandler['group'],
	title: string,
): FilterHandler => ({
	group,
	title,
	onClick: vi.fn(),
	isDisabled: () => false,
})
const filters = [
	handler('cloud', 'cloudValidator'),
	handler('other', 'highRetainer'),
	handler('other', 'highCompounder'),
	handler('other', 'highActivity'),
	handler('search', 'search'),
]
const props: NominationsViewProps = {
	canManageNominations: true,
	displayFor: 'canvas',
	eligibilityLoading: false,
	filterHandlers: filters,
	menuControls: (controls) =>
		createElement(
			'nav',
			{ 'data-control-bar': true },
			createElement(
				MenuControls,
				{ setters: [], allowRevert: false },
				controls,
			),
		),
	selectHandler: {
		title: 'removeSelected',
		popover: { text: '', callback: vi.fn() },
	},
	standaloneCards: false,
}

beforeEach(() => {
	state.fetching = false
	state.method = 'Optimal Selection'
})

test.each([
	['canvas', false],
	['card', false],
	['default', true],
] as const)(
	'%s standalone=%s shares one bar with the validator list selection provider',
	(displayFor, standaloneCards) => {
		const markup = renderToStaticMarkup(
			createElement(NominationsView, { ...props, displayFor, standaloneCards }),
		)
		const bars = [
			...markup.matchAll(
				/<nav[^>]*data-control-bar="true"[^>]*>[\s\S]*?<\/nav>/g,
			),
		]
		expect(bars).toHaveLength(1)
		const bar = bars[0][0]
		for (const label of [
			'generate',
			'cloudValidator',
			'otherValidators',
			'search',
		]) {
			expect(bar).toContain(label)
			expect(markup.replace(bar, '')).not.toContain(label)
		}
		// Candidate strategies belong to the closed dropdown, not a second row.
		for (const label of ['highRetainer', 'highCompounder', 'highActivity'])
			expect(markup).not.toContain(label)
	},
)

test('regeneration keeps the unified bar visible and disables every validator action', () => {
	state.fetching = true
	const markup = renderToStaticMarkup(createElement(NominationsView, props))
	const bar = markup.match(/<nav[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? ''
	expect(bar.match(/disabled=""/g)).toHaveLength(4)
	expect(markup).toContain('fetchingValidators')
})

test.each([{ canManageNominations: false }, { eligibilityLoading: true }])(
	'ineligible or loading accounts cannot see validator additions',
	(overrides) => {
		const markup = renderToStaticMarkup(
			createElement(NominationsView, { ...props, ...overrides }),
		)
		for (const label of ['cloudValidator', 'otherValidators', 'search'])
			expect(markup).not.toContain(label)
	},
)

test('method selection does not expose validator additions before a method is chosen', () => {
	state.method = null
	const markup = renderToStaticMarkup(createElement(NominationsView, props))
	expect(markup).toContain('method-selection')
	for (const label of ['cloudValidator', 'otherValidators', 'search'])
		expect(markup).not.toContain(label)
})
