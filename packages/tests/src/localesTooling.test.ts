// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { NAMESPACE_FILES } from '../../locale-cli/src/constants'
import { discoverNamespaceFiles } from '../../locale-cli/src/namespaceFiles'
import { getLocaleResourcesVersion } from '../../vite-shared/src/locales'

const directories: string[] = []
const temporaryDirectory = () => {
	const directory = mkdtempSync(join(tmpdir(), 'locales-tooling-'))
	directories.push(directory)
	return directory
}
afterEach(() => {
	for (const directory of directories.splice(0)) {
		rmSync(directory, { recursive: true, force: true })
	}
})

test('the CLI includes swap and discovers new JSON files without a namespace list edit', () => {
	expect(NAMESPACE_FILES).toContain('swap')
	const directory = temporaryDirectory()
	for (const file of ['swap.json', 'app.json', 'future.json', 'README.md']) {
		writeFileSync(join(directory, file), '{}')
	}
	mkdirSync(join(directory, 'directory.json'))
	expect(discoverNamespaceFiles(directory)).toEqual(['app', 'future', 'swap'])
})

test('the resource revision is deterministic and changes for non-English content or namespace changes', () => {
	const directory = temporaryDirectory()
	for (const locale of ['en', 'fr']) {
		mkdirSync(join(directory, locale))
		writeFileSync(
			join(directory, locale, 'swap.json'),
			'{"swap":{"send":"Send"}}',
		)
	}
	const original = getLocaleResourcesVersion(directory)
	expect(getLocaleResourcesVersion(directory)).toBe(original)
	writeFileSync(
		join(directory, 'fr', 'swap.json'),
		'{"swap":{"send":"Envoyer"}}',
	)
	const translated = getLocaleResourcesVersion(directory)
	expect(translated).not.toBe(original)
	writeFileSync(join(directory, 'en', 'future.json'), '{}')
	expect(getLocaleResourcesVersion(directory)).not.toBe(translated)
})
