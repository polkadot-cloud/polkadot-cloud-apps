// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DefaultLocale } from './config'
import type { LocaleProfile } from './types'
import { getInitialLanguage, getResources, loadLanguage } from './util/language'

export {
	DefaultLocale,
	getLoadedDateFormat,
	loadDateFormat,
	locales,
} from './config'

export const createI18next = (profile: LocaleProfile) => {
	const lng = getInitialLanguage()
	const { resources, dynamicLoad } = getResources(
		lng,
		profile.fallbackResources,
	)
	const i18next = Object.assign(createInstance(), { localeProfile: profile })

	i18next.use(initReactI18next).init({
		debug: import.meta.env.VITE_DEBUG_I18N === '1',
		fallbackLng: DefaultLocale,
		lng: dynamicLoad ? DefaultLocale : lng,
		resources,
	})

	if (dynamicLoad) {
		void loadLanguage(lng, i18next, profile).catch(() => undefined)
	}

	return i18next
}
