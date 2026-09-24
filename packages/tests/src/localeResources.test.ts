// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createInstance } from '../../locales/node_modules/i18next/index.js'
import chatEn from '../../locales/src/resources/en/chat.json'
import type { LocaleProfile } from '../../locales/src/types'
import { getResources, loadLanguage } from '../../locales/src/util/language'

vi.mock('../../event-tracking/src/index', () => ({
	onLocaleFromModalEvent: vi.fn(),
	onLocaleFromUrlEvent: vi.fn(),
}))

const storage = new Map<string, string>()
const fallbackResources = { app: { title: 'Nominate' }, ...chatEn }
const german = { app: { title: 'Nominieren' } }
const profile: LocaleProfile = {
	fallbackResources,
	resourceLoaders: {
		'../resources/de/app.json': async () => german,
	},
}

beforeEach(() => {
	storage.clear()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	})
})
afterEach(() => vi.unstubAllGlobals())

test('English includes chat and other languages load and cache without chat translations', async () => {
	const i18n = createInstance()
	const english = getResources('en', fallbackResources)
	expect(english.dynamicLoad).toBe(false)
	await i18n.init({
		lng: 'en',
		fallbackLng: 'en',
		resources: english.resources,
	})
	expect(i18n.t('title', { ns: 'chat' })).toBe('Guidance chat')

	await loadLanguage('de', i18n, profile)
	expect(i18n.language).toBe('de')
	expect(i18n.t('title', { ns: 'app' })).toBe('Nominieren')
	expect(i18n.hasResourceBundle('de', 'chat')).toBe(false)
	expect(getResources('de', fallbackResources)).toEqual({
		resources: { de: german },
		dynamicLoad: false,
	})

	await i18n.changeLanguage('en')
	expect(i18n.t('title', { ns: 'chat' })).toBe('Guidance chat')
})

test('cached translations still need all translated namespaces', () => {
	storage.set('lng_resources', JSON.stringify({ l: 'de', r: {} }))
	expect(getResources('de', fallbackResources).dynamicLoad).toBe(true)
})

test('missing resources outside the English-only exception still fail loading', async () => {
	const i18n = createInstance()
	await i18n.init({ lng: 'en' })
	await expect(
		loadLanguage('de', i18n, { ...profile, resourceLoaders: {} }),
	).rejects.toThrow('Missing locale resource: ../resources/de/app.json')
	expect(i18n.language).toBe('en')
	expect(storage.has('lng_resources')).toBe(false)
})
