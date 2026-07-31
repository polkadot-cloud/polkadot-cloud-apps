// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createI18next } from '../index'
import appEn from '../resources/en/app.json'
import modalsEn from '../resources/en/modals.json'
import swapEn from '../resources/en/swap.json'
import type { LocaleJson } from '../types'

const resourceLoaders = import.meta.glob<LocaleJson>(
	'../resources/*/{app,modals,swap}.json',
	{ import: 'default' },
)

export const i18next = createI18next({
	fallbackResources: {
		...appEn,
		...modalsEn,
		...swapEn,
	},
	resourceLoaders,
})
