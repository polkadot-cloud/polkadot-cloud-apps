// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test } from 'vitest'
import { localeDefinitions } from '../../consts/src/locales'
import { i18next as stakingI18n } from '../../locales/src/apps/staking'
import { i18next as swapI18n } from '../../locales/src/apps/swap'
import modalsEn from '../../locales/src/resources/en/modals.json'
import { changeLanguage } from '../../locales/src/util/language'

interface Messages {
	[key: string]: string | Messages
}

const flattenMessages = (messages: Messages, prefix = ''): [string, string][] =>
	Object.entries(messages).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key
		return typeof value === 'string'
			? [[path, value]]
			: flattenMessages(value, path)
	})

const englishMessages = Object.fromEntries(
	flattenMessages(modalsEn.modals.cloudApps),
)

beforeEach(() => {
	localStorage.clear()
	window.history.replaceState({}, '', '/')
})
afterEach(() => localStorage.clear())

for (const [profile, i18n] of [
	['staking', stakingI18n],
	['swap', swapI18n],
] as const) {
	test.each(Object.keys(localeDefinitions))(
		`${profile} loads all Cloud directory text in %s without language fallback`,
		async (locale) => {
			await changeLanguage(locale, i18n)
			const messages = Object.fromEntries(
				flattenMessages(i18n.getResource(locale, 'modals', 'cloudApps')),
			)
			expect(Object.keys(messages).sort()).toEqual(
				Object.keys(englishMessages).sort(),
			)
			for (const [key, value] of Object.entries(messages)) {
				expect(value.trim()).not.toBe('')
				expect(value.match(/\{\{[^}]+\}\}/g) ?? []).toEqual(
					englishMessages[key].match(/\{\{[^}]+\}\}/g) ?? [],
				)
				expect(
					i18n.t(`cloudApps.${key}`, { ns: 'modals', returnDetails: true }),
				).toMatchObject({ res: value, usedLng: locale })
			}

			for (const key of [
				'app:validators',
				'app:nominate',
				'app:sign',
				'modals:close',
			]) {
				const [namespace, name] = key.split(':')
				const value = i18n.getResource(locale, namespace, name)
				expect(value).toBeTypeOf('string')
				expect(value.trim()).not.toBe('')
				expect(i18n.t(key, { returnDetails: true })).toMatchObject({
					res: value,
					usedLng: locale,
				})
			}
		},
	)
}
