// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18next } from '../../locales/src'
import type { LocaleProfile } from '../../locales/src/types'
import { changeLanguage } from '../../locales/src/util/language'

const english = {
	app: { reset: 'Reset' },
	swap: { slippageSettings: 'Slippage' },
}
const german = {
	app: { reset: 'Zurücksetzen' },
	swap: { slippageSettings: 'Slippage-Toleranz' },
}
const profile = (
	loadSwap = async () => ({ swap: german.swap }),
): LocaleProfile => ({
	fallbackResources: english,
	resourceLoaders: {
		'../resources/de/app.json': async () => ({ app: german.app }),
		'../resources/de/swap.json': loadSwap,
	},
})
const cacheGerman = (swap: Record<string, string> = {}) => {
	localStorage.setItem('lng', 'de')
	localStorage.setItem(
		'lng_resources',
		JSON.stringify({ l: 'de', r: { app: german.app, swap } }),
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
	expect(i18n.t('slippageSettings', { ns: 'swap' })).toBe('Slippage')
	expect(i18n.t('reset', { ns: 'app' })).toBe('Zurücksetzen')
	await vi.waitFor(() =>
		expect(i18n.t('slippageSettings', { ns: 'swap' })).toBe(
			german.swap.slippageSettings,
		),
	)
})

test('startup refreshes cached translations from the current locale bundle', async () => {
	cacheGerman({ slippageSettings: 'Old translation' })
	const loadSwap = vi.fn(async () => ({ swap: german.swap }))
	const i18n = createI18next(profile(loadSwap))
	expect(i18n.t('slippageSettings', { ns: 'swap' })).toBe('Old translation')
	await vi.waitFor(() =>
		expect(i18n.t('slippageSettings', { ns: 'swap' })).toBe(
			german.swap.slippageSettings,
		),
	)
	expect(loadSwap).toHaveBeenCalledOnce()
	expect(JSON.parse(localStorage.getItem('lng_resources')!).r.swap).toEqual(
		german.swap,
	)
})

test('switching to a cached locale refreshes its translations', async () => {
	const i18n = createI18next(profile())
	cacheGerman({ slippageSettings: 'Old translation' })
	await changeLanguage('de', i18n)
	expect(i18n.t('slippageSettings', { ns: 'swap' })).toBe(
		german.swap.slippageSettings,
	)
})

test('a background locale refresh does not override a later language selection', async () => {
	cacheGerman()
	let resolve!: (value: { swap: typeof german.swap }) => void
	const pending = new Promise<{ swap: typeof german.swap }>((done) => {
		resolve = done
	})
	const i18n = createI18next(profile(() => pending))
	await changeLanguage('en', i18n)
	resolve({ swap: german.swap })
	await vi.waitFor(() =>
		expect(JSON.parse(localStorage.getItem('lng_resources')!).r.swap).toEqual(
			german.swap,
		),
	)
	expect(i18n.language).toBe('en')
})

test('a late language switch does not overwrite the selected language in the URL', async () => {
	let resolve!: (value: { swap: typeof german.swap }) => void
	const pending = new Promise<{ swap: typeof german.swap }>((done) => {
		resolve = done
	})
	const i18n = createI18next(profile(() => pending))
	const loading = changeLanguage('de', i18n)
	await changeLanguage('en', i18n)
	const englishHash = window.location.hash
	resolve({ swap: german.swap })
	await loading
	expect(i18n.language).toBe('en')
	expect(window.location.hash).toBe(englishHash)
})

const swapBundles = import.meta.glob<{ swap: Record<string, string> }>(
	'../../locales/src/resources/*/swap.json',
	{ eager: true, import: 'default' },
)
const appBundles = import.meta.glob<{ app: Record<string, unknown> }>(
	'../../locales/src/resources/*/app.json',
	{ eager: true, import: 'default' },
)
const englishSwap = swapBundles['../../locales/src/resources/en/swap.json'].swap
for (const [path, { swap }] of Object.entries(swapBundles)) {
	test(`${path} includes every swap label and preserves interpolation variables`, () => {
		expect(Object.keys(swap).sort()).toEqual(Object.keys(englishSwap).sort())
		const app = appBundles[path.replace('/swap.json', '/app.json')].app
		expect(app.swap).toBeTruthy()
		for (const [key, value] of Object.entries(swap)) {
			expect(value.trim()).not.toBe('')
			expect(value.match(/\{\{[^}]+\}\}/g) ?? []).toEqual(
				englishSwap[key].match(/\{\{[^}]+\}\}/g) ?? [],
			)
		}
	})
}
