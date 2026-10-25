// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18next } from '../../locales/src'
import type { LocaleProfile } from '../../locales/src/types'
import { changeLanguage } from '../../locales/src/util/language'

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

test('switching to a cached language refreshes its translations', async () => {
	localStorage.setItem('lng', 'en')
	const loadModals = vi.fn(async () => ({ modals: german.modals }))
	const i18n = createI18next(profile(loadModals))
	cacheGerman({ withBalances: 'Old translation' })
	await changeLanguage('de', i18n)
	expect(i18n.language).toBe('de')
	expect(i18n.t('withBalances', { ns: 'modals' })).toBe(
		german.modals.withBalances,
	)
	expect(loadModals).toHaveBeenCalledOnce()
})

test('a late translation refresh does not undo a subsequent language selection', async () => {
	window.history.replaceState({}, '', '/#?l=en')
	localStorage.setItem('lng', 'en')
	let finishLoading!: (value: { modals: typeof german.modals }) => void
	const loadModals = vi.fn(
		() =>
			new Promise<{ modals: typeof german.modals }>((resolve) => {
				finishLoading = resolve
			}),
	)
	const i18n = createI18next(profile(loadModals))
	cacheGerman()
	const refresh = changeLanguage('de', i18n)
	await vi.waitFor(() => expect(loadModals).toHaveBeenCalledOnce())
	await changeLanguage('en', i18n)
	finishLoading({ modals: german.modals })
	await refresh
	expect(i18n.language).toBe('en')
	expect(localStorage.getItem('lng')).toBe('en')
	expect(window.location.hash).toBe('#?l=en')
})
