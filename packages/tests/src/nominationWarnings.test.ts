// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { getPageValidatorWarningGroups } from '../../app-staking/src/library/GenerateNominations/utils'
import { NominationWarnings } from '../../app-staking/src/library/NominationWarnings'
import { ValidatorWarning } from '../../app-staking/src/library/NominationWarnings/ValidatorWarning'
import { PageTitle } from '../../app-staking/src/library/PageTitle'
import statusClasses from '../../ui-core/src/base/StatusCard/index.module.scss'

const state = vi.hoisted(() => ({
	canDisplay: true,
	canFix: true,
	dangerCount: 0,
	handleFix: vi.fn(),
	hasWarnings: true,
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
	state.validatorWarningGroups = []
})

test.each([1, 2])(
	'shows the reduction-specific risk message for %s historical backing warnings',
	(count) => {
		const validators = Array.from({ length: count }, (_, index) => ({
			address: String(index),
			prefs: { commission: 0, blocked: false },
		}))
		state.validatorWarningGroups = getPageValidatorWarningGroups(
			validators,
			Object.fromEntries(
				validators.map(({ address }) => [address, ['LOW_HISTORICAL_BACKING']]),
			),
		)
		const markup = renderToStaticMarkup(createElement(NominationWarnings))

		expect(markup).toContain(
			count === 1
				? '1 validator with low historical backing'
				: '2 validators with low historical backing',
		)
		expect(markup).toContain('may be at risk')
		expect(markup).toContain('600 to 320 active validators')
		expect(markup).not.toContain(
			'Actual selection depends on current nominations and stake allocation.',
		)
		expect(markup).toContain(
			'href="https://polkadot.cloud/blog/en/low-backing-validator-warnings"',
		)
		expect(markup).toContain('target="_blank"')
		expect(markup).toContain('rel="noopener noreferrer"')
		expect(markup).toContain('Read More</a>')
		expect(markup).toContain(statusClasses.warning)
		expect(markup).not.toContain(statusClasses.danger)
		expect(markup).not.toContain('<button')
	},
)

test('warnings without a URL omit the Read More link and keep the fix action', () => {
	const markup = renderToStaticMarkup(
		createElement(ValidatorWarning, {
			onFix: state.handleFix,
			children: 'Warning',
		}),
	)
	expect(markup).not.toContain('<a ')
	expect(markup).toContain('Fix Issues')
})

test('page titles show an amber historical backing notice directly below the heading', () => {
	state.validatorWarningGroups = getPageValidatorWarningGroups(
		[{ address: 'historical', prefs: { commission: 0, blocked: false } }],
		{ historical: ['LOW_HISTORICAL_BACKING'] },
	)
	const markup = renderToStaticMarkup(
		createElement(PageTitle, { title: 'Validators' }),
	)
	expect(markup).toContain('Validators</h1>')
	expect(markup.indexOf('</header>')).toBeLessThan(
		markup.indexOf('role="status"'),
	)
	expect(markup.match(/role="status"/g)).toHaveLength(1)
	expect(markup).toContain(statusClasses.warning)
	expect(markup).not.toContain(statusClasses.danger)
	expect(markup).toContain('Read More</a>')
})

test.each([0, 1])(
	'historical backing pool notices reflect actual danger count %s',
	(dangerCount) => {
		state.isPoolMember = true
		state.dangerCount = dangerCount
		state.validatorWarningGroups = getPageValidatorWarningGroups(
			[{ address: 'historical', prefs: { commission: 0, blocked: false } }],
			{ historical: ['LOW_HISTORICAL_BACKING'] },
		)
		const markup = renderToStaticMarkup(createElement(NominationWarnings))
		expect(markup).toContain(
			dangerCount ? statusClasses.danger : statusClasses.warning,
		)
		if (!dangerCount) expect(markup).not.toContain(statusClasses.danger)
	},
)
