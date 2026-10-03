// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { readdirSync } from 'node:fs'

export const discoverNamespaceFiles = (
	directory: string | URL = new URL(
		'../../locales/src/resources/en/',
		import.meta.url,
	),
): string[] =>
	readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => entry.name.slice(0, -5))
		.sort()
