// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue, varToUrlHash } from '@w3ux/utils'
import { onLocaleFromModalEvent, onLocaleFromUrlEvent } from 'event-tracking'
import type { i18n } from 'i18next'
import { DefaultLocale, locales } from '../config'
import type { LocaleJson, LocaleProfile } from '../types'

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
	fallbackResources: LocaleJson,
): { resources: Record<string, LocaleJson>; dynamicLoad: boolean } => {
	if (lng === DefaultLocale) {
		return {
			resources: { [lng]: fallbackResources },
			dynamicLoad: false,
		}
	}

	const localResources = localStorage.getItem('lng_resources')
	if (localResources) {
		try {
			const { l, r } = JSON.parse(localResources)
			if (
				l === lng &&
				typeof r === 'object' &&
				r !== null &&
				!Array.isArray(r) &&
				Object.keys(fallbackResources).every((namespace) =>
					Object.hasOwn(r, namespace),
				)
			) {
				return {
					resources: { [lng]: r as LocaleJson },
					dynamicLoad: false,
				}
			}
		} catch {
			// Ignore invalid cached resources.
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
	const { resources, dynamicLoad } = getResources(
		lng,
		profile.fallbackResources,
	)

	localStorage.setItem('lng', lng)
	if (dynamicLoad) {
		await loadLanguage(lng, i18next, profile)
	} else {
		addI18nResources(i18next, lng, resources[lng])
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
	const resources = await loadResources(lng, profile)
	localStorage.setItem(
		'lng_resources',
		JSON.stringify({ l: lng, r: resources }),
	)
	addI18nResources(i18next, lng, resources)
	await i18next.changeLanguage(lng)
}
