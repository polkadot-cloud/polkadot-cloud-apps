// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface LocaleJson {
	[key: string]: LocaleJsonValue
}

export type LocaleJsonValue = string | LocaleJson | LocaleJsonValue[]

export type LocaleResourceLoaders = Record<string, () => Promise<LocaleJson>>

export interface LocaleProfile {
	fallbackResources: LocaleJson
	resourceLoaders: LocaleResourceLoaders
}
