// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const resourceDirectory = fileURLToPath(
	new URL('../../locales/src/resources', import.meta.url),
)

export const getLocaleResourcesVersion = (directory = resourceDirectory) => {
	const hash = createHash('sha256')
	for (const locale of readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort()) {
		for (const file of readdirSync(join(directory, locale)).sort()) {
			if (!file.endsWith('.json')) continue
			hash.update(`${locale}/${file}\0`)
			hash.update(readFileSync(join(directory, locale, file)))
		}
	}
	return hash.digest('hex')
}

// Invalidate persisted translations when any resource changes, without bundling its contents.
export const localeResourcesVersionPlugin = (): Plugin => ({
	name: 'locale-resources-version',
	config: () => ({
		define: {
			'import.meta.env.VITE_LOCALE_RESOURCES_VERSION': JSON.stringify(
				getLocaleResourcesVersion(),
			),
		},
	}),
})
