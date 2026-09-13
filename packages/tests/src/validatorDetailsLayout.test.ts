// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import { Tooltip } from '../../app-staking/node_modules/radix-ui/dist/index.mjs'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { useRetainmentStatsEnabled } from '../../app-staking/src/hooks/useRetainmentStatsEnabled'
import { useValidatorDetailsEnabled } from '../../app-staking/src/hooks/useValidatorDetailsEnabled'
import { Item as NominationItem } from '../../app-staking/src/library/NominationList/Item'
import { Item as ValidatorItem } from '../../app-staking/src/library/ValidatorList/Item'
import { ValidatorBar } from '../../app-staking/src/library/ValidatorList/ValidatorBar'
import { ValidatorCard } from '../../app-staking/src/library/ValidatorList/ValidatorCard'
import { useRetainmentStatsData } from '../../ui-app/src/RetainmentStats/useRetainmentStatsData'

const { state } = vi.hoisted(() => ({
	state: { network: 'kusama', api: true },
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.api }),
}))
vi.mock(
	'hooks/useValidatorDetailsEnabled',
	() => import('../../app-staking/src/hooks/useValidatorDetailsEnabled'),
)
vi.mock('../../app-staking/src/library/NominationList/BasicItem', () => ({
	BasicItem: () => 'basic-item',
}))
vi.mock('../../app-staking/src/library/NominationList/DetailedItem', () => ({
	DetailedItem: () => 'detailed-item',
}))
vi.mock('../../app-staking/src/library/ValidatorList/BasicItem', () => ({
	BasicItem: () => 'basic-item',
}))
vi.mock('../../app-staking/src/library/ValidatorList/DetailedItem', () => ({
	DetailedItem: () => 'detailed-item',
}))
vi.mock('contexts/List', () => ({ useList: () => ({ selectable: false }) }))
vi.mock('library/List/EraPointsGraph/HistoricalEraPoints', () => ({
	HistoricalEraPoints: () => 'activity-graph',
}))
vi.mock('../../app-staking/src/library/ValidatorList/ValidatorSummary', () => ({
	ValidatorSummaryMetrics: () => 'APY stake status',
}))
vi.mock('../../app-staking/src/library/ListItem/Labels/Identity', () => ({
	Identity: () => 'validator-identity',
}))
vi.mock(
	'../../app-staking/src/library/ListItem/Buttons/RetainmentHistory',
	() => ({ RetainmentHistory: () => 'retainment-history' }),
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

test.each([
	['polkadot', true, true, true],
	['kusama', true, true, false],
	['polkadot', false, false, false],
	['kusama', false, false, false],
	['paseo', false, false, false],
	['paseo', true, false, false],
] as const)(
	'%s API=%s selects enhanced=%s, retainment=%s',
	(network, api, enhanced, retainment) => {
		state.network = network
		state.api = api
		expect(useValidatorDetailsEnabled()).toBe(enhanced)
		expect(useRetainmentStatsEnabled()).toBe(retainment)
		for (const format of ['row', 'col'] as const) {
			const props = {
				validator: {
					address: 'validator',
					prefs: null,
					validatorStatus: 'waiting' as const,
				},
				displayFor: 'default' as const,
				format,
				eraPoints: [],
			}
			const expected = enhanced ? 'detailed-item' : 'basic-item'
			expect(renderToStaticMarkup(createElement(ValidatorItem, props))).toBe(
				expected,
			)
			expect(
				renderToStaticMarkup(
					createElement(NominationItem, {
						...props,
						bondFor: 'nominator',
						nominator: 'stash',
					}),
				),
			).toBe(expected)
		}
	},
)

const Fixture = ({
	format,
	showRetainment,
}: {
	format: 'row' | 'col'
	showRetainment: boolean
}) => {
	const retainmentStats = useRetainmentStatsData({
		selfStakeMax: false,
		unit: 'KSM',
		units: 12,
		statusAccent: 'danger',
	})
	const common = {
		showRetainment,
		actions: 'copy share favorite',
		displayFor: 'default' as const,
		eraPoints: [],
		retainmentStats,
		retainmentWindow: 'THREE_MONTHS' as const,
		onRetainmentWindowChange: () => {},
		unit: 'KSM',
	}
	return format === 'row'
		? createElement(ValidatorBar, {
				...common,
				selfStakeMax: false,
				validator: {
					address: 'alice',
					prefs: { commission: 5, blocked: true },
					validatorStatus: 'active',
				},
			})
		: createElement(ValidatorCard, {
				...common,
				address: 'alice',
				blocked: true,
				identity: 'validator-identity',
				summary: 'APY stake status',
			})
}

test.each(['row', 'col'] as const)(
	'%s omits unsupported retainment while keeping supported content',
	(format) => {
		const markup = renderToStaticMarkup(
			createElement(Fixture, { format, showRetainment: false }),
		)
		expect(markup).toContain('validator-identity')
		expect(markup).toContain('APY stake status')
		expect(markup).toContain('activity-graph')
		expect(markup).toContain('blocked')
		expect(markup).toContain('copy share favorite')
		expect(markup).not.toContain('data-section="retainment"')
		expect(markup).not.toContain('retainment-history')
		expect(markup).not.toContain('data-status-accent="danger"')
		expect(markup).not.toContain('compoundRate')
		if (format === 'row') expect(markup).toContain('data-retainment="false"')
	},
)

test.each(['row', 'col'] as const)(
	'%s retains supported retainment content',
	(format) => {
		const markup = renderToStaticMarkup(
			createElement(
				Tooltip.Provider,
				null,
				createElement(Fixture, { format, showRetainment: true }),
			),
		)
		expect(markup).toContain('data-status-accent="danger"')
		expect(markup).toContain('compound')
	},
)
