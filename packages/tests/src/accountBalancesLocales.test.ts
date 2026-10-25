// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18next } from '../../locales/src'
import type { LocaleProfile } from '../../locales/src/types'

const english = {
	app: { reset: 'Reset' },
	modals: { withBalances: 'With Stablecoins' },
}
const german = {
	app: { reset: 'Zurücksetzen' },
	modals: { withBalances: 'Mit Stablecoins' },
}
const profile = (
	loadModals = async () => ({ modals: german.modals }),
): LocaleProfile => ({
	fallbackResources: english,
	resourceLoaders: {
		'../resources/de/app.json': async () => ({ app: german.app }),
		'../resources/de/modals.json': loadModals,
	},
})
const cacheGerman = (modals: Record<string, string> = {}) => {
	localStorage.setItem('lng', 'de')
	localStorage.setItem(
		'lng_resources',
		JSON.stringify({ l: 'de', r: { app: german.app, modals } }),
	)
}

beforeEach(() => {
	localStorage.clear()
	window.history.replaceState({}, '', '/')
})
afterEach(() => localStorage.clear())

test('cached locales retain English fallback for missing strings', async () => {
	cacheGerman()
	const i18n = createI18next(profile())
	expect(i18n.language).toBe('de')
	expect(i18n.t('withBalances', { ns: 'modals' })).toBe('With Stablecoins')
	expect(i18n.t('reset', { ns: 'app' })).toBe('Zurücksetzen')
	await vi.waitFor(() =>
		expect(i18n.t('withBalances', { ns: 'modals' })).toBe(
			german.modals.withBalances,
		),
	)
})

test('startup refreshes cached translations from the current locale bundle', async () => {
	cacheGerman({ withBalances: 'Old translation' })
	const loadModals = vi.fn(async () => ({ modals: german.modals }))
	const i18n = createI18next(profile(loadModals))
	expect(i18n.t('withBalances', { ns: 'modals' })).toBe('Old translation')
	await vi.waitFor(() =>
		expect(i18n.t('withBalances', { ns: 'modals' })).toBe(
			german.modals.withBalances,
		),
	)
	expect(loadModals).toHaveBeenCalledOnce()
	expect(JSON.parse(localStorage.getItem('lng_resources')!).r.modals).toEqual(
		german.modals,
	)
})
