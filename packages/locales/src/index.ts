// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DefaultLocale } from './config'

export {
	DefaultLocale,
	fallbackResources,
	getLoadedDateFormat,
	lngNamespaces,
	loadDateFormat,
	locales,
} from './config'

import {
	doDynamicImport,
	getInitialLanguage,
	getResources,
} from './util/language'

// Get initial language.
const lng: string = getInitialLanguage()

// Get default resources and whether a dynamic load is required for the active language
const { resources, dynamicLoad } = getResources(lng)

// Default language to show before any dynamic load
const defaultLng = dynamicLoad ? DefaultLocale : lng

// Configure i18n object
i18next
	// .use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: import.meta.env.VITE_DEBUG_I18N === '1',
		fallbackLng: DefaultLocale,
		lng: defaultLng,
		resources,
	})

// Dynamically load default language resources if needed
if (dynamicLoad) {
	doDynamicImport(lng, i18next)
}

export { i18next }
