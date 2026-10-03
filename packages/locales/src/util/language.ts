// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue, varToUrlHash } from '@polkadot-cloud/utils'
import { onLocaleFromModalEvent, onLocaleFromUrlEvent } from 'event-tracking'
import type { i18n } from 'i18next'
import { DefaultLocale, locales } from '../config'
import type { LocaleJson, LocaleProfile } from '../types'
import {
	normalizeResources,
	readCachedResources,
	serializeResources,
} from './cache'

type ProfiledI18n = i18n & { localeProfile?: LocaleProfile }

/* Language Management */
export const getInitialLanguage = () => {
	const urlLng = extractUrlValue('l')
	if (urlLng && Object.hasOwn(locales, urlLng)) {
		onLocaleFromUrlEvent(urlLng)
		localStorage.setItem('lng', urlLng)
		return urlLng
	}

	const localLng = localStorage.getItem('lng')
	if (localLng && Object.hasOwn(locales, localLng)) {
		return localLng
	}

	const supportedBrowser = Object.keys(locales).find((locale) =>
		navigator.language.startsWith(locale),
	)
	if (supportedBrowser) {
		localStorage.setItem('lng', supportedBrowser)
		return supportedBrowser
	}

	localStorage.setItem('lng', DefaultLocale)
	return DefaultLocale
}

export const getResources = (
	lng: string,
	profile: LocaleProfile,
): { resources: Record<string, LocaleJson>; dynamicLoad: boolean } => {
	const { fallbackResources } = profile
	if (lng === DefaultLocale) {
		return {
			resources: { [lng]: fallbackResources },
			dynamicLoad: false,
		}
	}

	const localResources = localStorage.getItem('lng_resources')
	if (localResources) {
		const cachedResources = readCachedResources(localResources, lng, profile)
		if (cachedResources) {
			localStorage.setItem(
				'lng_resources',
				serializeResources(lng, cachedResources, profile),
			)
			return {
				resources: {
					[DefaultLocale]: fallbackResources,
					[lng]: cachedResources,
				},
				dynamicLoad: false,
			}
		}
	}

	return {
		resources: { [DefaultLocale]: fallbackResources },
		dynamicLoad: true,
	}
}

export const changeLanguage = async (lng: string, i18next: i18n) => {
	const profile = (i18next as ProfiledI18n).localeProfile
	if (!profile) {
		throw new Error('Missing locale profile for i18next instance')
	}

	onLocaleFromModalEvent(lng)

	// Check whether resources exist and need to be dynamically loaded.
	const { resources, dynamicLoad } = getResources(lng, profile)

	localStorage.setItem('lng', lng)
	if (dynamicLoad) {
		await loadLanguage(lng, i18next, profile)
	} else {
		Object.entries(resources).forEach(([language, resource]) => {
			addI18nResources(i18next, language, resource)
		})
		await i18next.changeLanguage(lng)
	}
	varToUrlHash('l', lng, false)
}

/* Resource Loading */
const loadResources = async (lng: string, profile: LocaleProfile) => {
	const resources = await Promise.all(
		Object.keys(profile.fallbackResources).map((namespace) => {
			const path = `../resources/${lng}/${namespace}.json`
			const load = profile.resourceLoaders[path]
			if (!load) {
				throw new Error(`Missing locale resource: ${path}`)
			}
			return load()
		}),
	)

	return Object.assign({}, ...resources) as LocaleJson
}

const addI18nResources = (
	i18next: i18n,
	lng: string,
	resources: LocaleJson,
) => {
	Object.entries(resources).forEach(([namespace, resource]) => {
		i18next.addResourceBundle(lng, namespace, resource)
	})
}

export const loadLanguage = async (
	lng: string,
	i18next: i18n,
	profile: LocaleProfile,
) => {
	const resources = normalizeResources(
		await loadResources(lng, profile),
		profile.fallbackResources,
	)
	if (!resources) {
		throw new Error(
			`Invalid locale resources for profile ${profile.id}: ${lng}`,
		)
	}
	localStorage.setItem(
		'lng_resources',
		serializeResources(lng, resources, profile),
	)
	addI18nResources(i18next, DefaultLocale, profile.fallbackResources)
	addI18nResources(i18next, lng, resources)
	await i18next.changeLanguage(lng)
}
