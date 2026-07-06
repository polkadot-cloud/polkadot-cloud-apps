// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localeDefinitions } from 'consts/locales'
import type { Locale } from 'date-fns'
import { enGB } from 'date-fns/locale/en-GB'
import appEn from './resources/en/app.json'
import helpEn from './resources/en/help.json'
import modalsEn from './resources/en/modals.json'
import pagesEn from './resources/en/pages.json'
import tipsEn from './resources/en/tips.json'
import type { LocaleEntry } from './types'

// The default locale
export const DefaultLocale = 'en'

type LocaleKey = keyof typeof localeDefinitions

// Available locales as key value pairs
export const locales: Record<string, LocaleEntry> = localeDefinitions

// Map app locale codes to date-fns locale loaders so non-default formats stay code-split.
const dateFormatLoaders = {
	en: async () => enGB,
	de: () => import('date-fns/locale/de').then(({ de }) => de),
	ko: () => import('date-fns/locale/ko').then(({ ko }) => ko),
	pt: () => import('date-fns/locale/pt-BR').then(({ ptBR }) => ptBR),
	tr: () => import('date-fns/locale/tr').then(({ tr }) => tr),
	zh: () => import('date-fns/locale/zh-CN').then(({ zhCN }) => zhCN),
	es: () => import('date-fns/locale/es').then(({ es }) => es),
	ja: () => import('date-fns/locale/ja').then(({ ja }) => ja),
	fr: () => import('date-fns/locale/fr').then(({ fr }) => fr),
} satisfies Record<LocaleKey, () => Promise<Locale>>

// Keep the default date format synchronously available and cache lazy-loaded formats.
const dateFormatCache: Partial<Record<LocaleKey, Locale>> = {
	en: enGB,
}

const isLocaleKey = (lng: string): lng is LocaleKey => lng in dateFormatLoaders

// Normalize runtime language strings before cache or loader lookups.
const getDateFormatKey = (lng: string): LocaleKey =>
	isLocaleKey(lng) ? lng : DefaultLocale

// Return an already-loaded date format, falling back to the default while lazy formats load.
export const getLoadedDateFormat = (lng: string): Locale =>
	dateFormatCache[getDateFormatKey(lng)] ?? enGB

// Load and cache the requested date-fns locale only when it is needed.
export const loadDateFormat = async (lng: string): Promise<Locale> => {
	const key = getDateFormatKey(lng)
	const cachedDateFormat = dateFormatCache[key]
	if (cachedDateFormat) {
		return cachedDateFormat
	}
	try {
		const dateFormat = await dateFormatLoaders[key]()
		dateFormatCache[key] = dateFormat
		return dateFormat
	} catch {
		return enGB
	}
}

// Supported namespaces
export const lngNamespaces: string[] = [
	'app',
	'help',
	'modals',
	'pages',
	'tips',
]

// Default structure of language resources
export const fallbackResources = {
	...appEn,
	...helpEn,
	...modalsEn,
	...pagesEn,
	...tipsEn,
}
