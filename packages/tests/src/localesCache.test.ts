// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// <reference types="vite/client" />

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createInstance } from '../../locales/node_modules/i18next/index.js'
import { createI18next } from '../../locales/src/index'
import type { LocaleJson, LocaleProfile } from '../../locales/src/types'
import { serializeResources } from '../../locales/src/util/cache'
import {
	changeLanguage,
	getResources,
	loadLanguage,
} from '../../locales/src/util/language'

vi.mock('../../locales/node_modules/@polkadot-cloud/utils/index.js', () => ({
	extractUrlValue: () => undefined,
	varToUrlHash: vi.fn(),
}))
vi.mock('../../event-tracking/src/index.ts', () => ({
	onLocaleFromModalEvent: vi.fn(),
	onLocaleFromUrlEvent: vi.fn(),
}))

const fallbackResources: LocaleJson = {
	app: {
		send: 'Send',
		newKey: 'Current English text',
		time: { second_one: 'second', second_other: 'seconds' },
		details: ['Title', ['First paragraph']],
	},
	modals: { selectLanguage: 'Select Language' },
	swap: { feeToken: 'Fee Token' },
}
const translatedResources: LocaleJson = {
	app: {
		send: 'Senden',
		time: {
			second_one: 'Sekunde',
			second_few: 'few',
			second_other: 'Sekunden',
		},
		details: ['Titel', ['Erster Absatz', 'Zweiter Absatz']],
	},
	modals: { selectLanguage: 'Sprache auswählen' },
	swap: { feeToken: 'Gebühren-Token' },
}
let storage: Map<string, string>
let profile: LocaleProfile = {
	id: 'swap',
	resourceVersion: 'resources-v1',
	fallbackResources,
	resourceLoaders: {},
}

beforeEach(() => {
	storage = new Map()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	})
	profile = {
		id: 'swap',
		resourceVersion: 'resources-v1',
		fallbackResources,
		resourceLoaders: Object.fromEntries(
			Object.entries(translatedResources).map(([namespace, resource]) => [
				`../resources/de/${namespace}.json`,
				vi.fn(async () => ({ [namespace]: resource })),
			]),
		),
	}
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.clearAllMocks()
})

test('cold non-English startup retains current English while translations load', async () => {
	storage.set('lng', 'de')
	const i18n = createI18next(profile)
	expect(i18n.language).toBe('en')
	expect(i18n.t('newKey', { ns: 'app' })).toBe('Current English text')
	await vi.waitFor(() => expect(i18n.language).toBe('de'))
	expect(i18n.t('send', { ns: 'app' })).toBe('Senden')
	expect(i18n.t('newKey', { ns: 'app' })).toBe('Current English text')
})

test('warm startup retains current English without requesting resources', () => {
	storage.set('lng', 'de')
	storage.set(
		'lng_resources',
		serializeResources('de', translatedResources, profile),
	)
	const i18n = createI18next(profile)
	expect(i18n.language).toBe('de')
	expect(i18n.hasResourceBundle('en', 'app')).toBe(true)
	expect(i18n.t('send', { ns: 'app' })).toBe('Senden')
	expect(i18n.t('newKey', { ns: 'app' })).toBe('Current English text')
	for (const loader of Object.values(profile.resourceLoaders)) {
		expect(loader).not.toHaveBeenCalled()
	}
})

test.each([
	['legacy', JSON.stringify({ l: 'de', r: translatedResources })],
	['invalid JSON', '{'],
	['invalid object', 'null'],
	[
		'different language',
		serializeResources('fr', translatedResources, profile),
	],
	[
		'different profile',
		serializeResources('de', translatedResources, {
			...profile,
			id: 'staking',
		}),
	],
	[
		'old resource revision',
		serializeResources('de', translatedResources, {
			...profile,
			resourceVersion: 'resources-v0',
		}),
	],
	[
		'old schema',
		JSON.stringify({
			...JSON.parse(serializeResources('de', translatedResources, profile)),
			schemaVersion: 0,
		}),
	],
	[
		'missing namespace',
		serializeResources('de', { app: {}, modals: {} }, profile),
	],
	[
		'malformed namespace',
		serializeResources(
			'de',
			{ ...translatedResources, swap: 'invalid' },
			profile,
		),
	],
])('rejects a %s cache and retains English until reload', (_reason, cache) => {
	storage.set('lng_resources', cache)
	expect(getResources('de', profile)).toEqual({
		resources: { en: fallbackResources },
		dynamicLoad: true,
	})
})

test('normalizes cached namespaces and keys without dropping plural forms or paragraphs', () => {
	storage.set(
		'lng_resources',
		serializeResources(
			'de',
			{
				...translatedResources,
				pages: { unused: 'stale' },
				app: {
					...(translatedResources.app as LocaleJson),
					obsolete: 'stale',
					newKey: 123 as unknown as string,
					time: {
						...((translatedResources.app as LocaleJson).time as LocaleJson),
						obsolete: 'stale',
					},
				},
			},
			profile,
		),
	)
	const { resources, dynamicLoad } = getResources('de', profile)
	expect(dynamicLoad).toBe(false)
	expect(resources.en).toEqual(fallbackResources)
	expect(resources.de).toEqual(translatedResources)
	expect(JSON.parse(storage.get('lng_resources') ?? '{}').r).toEqual(
		translatedResources,
	)
})

test('loading and switching languages writes a versioned cache and restores English', async () => {
	const i18n = Object.assign(createInstance(), { localeProfile: profile })
	await i18n.init({ lng: 'en', fallbackLng: 'en' })
	await changeLanguage('de', i18n)
	expect(i18n.language).toBe('de')
	expect(i18n.t('newKey', { ns: 'app' })).toBe('Current English text')
	expect(JSON.parse(storage.get('lng_resources') ?? '{}')).toMatchObject({
		schemaVersion: 1,
		profile: 'swap',
		resourceVersion: 'resources-v1',
		l: 'de',
	})
	await changeLanguage('en', i18n)
	expect(i18n.t('send', { ns: 'app' })).toBe('Send')
	await changeLanguage('de', i18n)
	expect(i18n.t('send', { ns: 'app' })).toBe('Senden')
	for (const loader of Object.values(profile.resourceLoaders)) {
		expect(loader).toHaveBeenCalledTimes(1)
	}
})

test('failed language loading leaves English available and does not cache partial resources', async () => {
	profile.resourceLoaders['../resources/de/modals.json'] = vi.fn(async () => {
		throw new Error('request failed')
	})
	const i18n = createInstance()
	await i18n.init({
		lng: 'en',
		fallbackLng: 'en',
		resources: { en: fallbackResources },
	})
	await expect(loadLanguage('de', i18n, profile)).rejects.toThrow(
		'request failed',
	)
	expect(i18n.language).toBe('en')
	expect(i18n.t('send', { ns: 'app' })).toBe('Send')
	expect(storage.has('lng_resources')).toBe(false)
})
