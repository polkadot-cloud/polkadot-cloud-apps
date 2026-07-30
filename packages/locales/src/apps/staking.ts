// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createI18next } from '../index'
import appEn from '../resources/en/app.json'
import helpEn from '../resources/en/help.json'
import modalsEn from '../resources/en/modals.json'
import pagesEn from '../resources/en/pages.json'
import tipsEn from '../resources/en/tips.json'
import type { LocaleJson } from '../types'

const resourceLoaders = import.meta.glob<LocaleJson>(
	'../resources/*/{app,help,modals,pages,tips}.json',
	{ import: 'default' },
)

export const i18next = createI18next({
	fallbackResources: {
		...appEn,
		...helpEn,
		...modalsEn,
		...pagesEn,
		...tipsEn,
	},
	resourceLoaders,
})
