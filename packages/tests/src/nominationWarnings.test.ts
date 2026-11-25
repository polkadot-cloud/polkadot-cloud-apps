// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import {
	getPageValidatorWarningGroups,
	getValidatorItemWarnings,
} from '../../app-staking/src/library/GenerateNominations/utils'
import { NominationWarnings } from '../../app-staking/src/library/NominationWarnings'
import { PageTitle } from '../../app-staking/src/library/PageTitle'
import type { ValidatorWarnings } from '../../plugin-staking-api/src/types'
import statusClasses from '../../ui-core/src/base/StatusCard/index.module.scss'

const state = vi.hoisted(() => ({
	canDisplay: true,
	canFix: true,
	dangerCount: 0,
	handleFix: vi.fn(),
	hasWarnings: false,
	isPoolMember: false,
	validatorWarningGroups: [] as ReturnType<
		typeof getPageValidatorWarningGroups
	>,
}))

vi.mock('hooks/useNominationWarnings', () => ({
	useNominationWarnings: () => state,
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	async () => {
		const { createInstance } = await import(
			'../../locales/node_modules/i18next/dist/esm/i18next.js'
		)
		const { default: english } = await import(
			'../../locales/src/resources/en/app.json'
		)
		const i18n = createInstance()
		await i18n.init({
			lng: 'en',
			ns: ['app'],
			defaultNS: 'app',
			fallbackLng: false,
			resources: { en: english },
		})
		return { useTranslation: () => ({ t: i18n.getFixedT('en', 'app') }) }
	},
)

beforeEach(() => {
	state.isPoolMember = false
	state.dangerCount = 0
	state.hasWarnings = false
	state.validatorWarningGroups = []
})

test.each([false, true])(
	'historical backing alone renders no staking page notice (pool member: %s)',
	(isPoolMember) => {
		state.isPoolMember = isPoolMember
		const warnings = {
			historical: ['LOW_HISTORICAL_BACKING'],
		} satisfies ValidatorWarnings
		state.hasWarnings = getValidatorItemWarnings(warnings.historical).length > 0
		state.validatorWarningGroups = getPageValidatorWarningGroups(
			[{ address: 'historical', prefs: { commission: 0, blocked: false } }],
			warnings,
		)
		expect(renderToStaticMarkup(createElement(NominationWarnings))).toBe('')
	},
)

test.each([undefined, 'https://example.com/validator-warning'])(
	'stake page warnings keep the fix action and render the configured link (%s)',
	(readMoreUrl) => {
		state.validatorWarningGroups = getPageValidatorWarningGroups(
			[{ address: 'zug', prefs: { commission: 0, blocked: false } }],
			{ zug: ['ZUG_VALIDATOR', 'LOW_HISTORICAL_BACKING'] },
		).map((group) => ({ ...group, readMoreUrl }))
		const markup = renderToStaticMarkup(
			createElement(PageTitle, {
				title: 'Stake',
				showNominationWarnings: true,
			}),
		)
		expect(markup).toContain('Stake</h1>')
		expect(markup.indexOf('</header>')).toBeLessThan(
			markup.indexOf('role="status"'),
		)
		expect(markup.match(/role="status"/g)).toHaveLength(1)
		expect(markup).toContain(statusClasses.danger)
		expect(markup).toContain('1 Zug validator')
		expect(markup).toContain('Fix Issues')
		if (readMoreUrl) {
			expect(markup).toContain(`href="${readMoreUrl}"`)
			expect(markup).toContain('target="_blank"')
			expect(markup).toContain('rel="noopener noreferrer"')
			expect(markup).toContain('Read More</a>')
		} else {
			expect(markup).not.toContain('Read More')
		}
	},
)

test.each([0, 1])(
	'pool notices for Hetzner reflect the low-retainment danger count %s',
	(dangerCount) => {
		state.isPoolMember = true
		state.dangerCount = dangerCount
		state.hasWarnings = getValidatorItemWarnings(['HETZNER']).length > 0
		const markup = renderToStaticMarkup(createElement(NominationWarnings))
		expect(markup).toContain(
			dangerCount ? statusClasses.danger : statusClasses.warning,
		)
		if (!dangerCount) expect(markup).not.toContain(statusClasses.danger)
	},
)
