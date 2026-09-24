// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { spawnSync } from 'node:child_process'
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

let root: string
const writeLocale = (language: string, namespace: string, keys: object) => {
	writeFileSync(
		join(root, 'src', 'resources', language, `${namespace}.json`),
		JSON.stringify({ [namespace]: keys }),
	)
}
const validate = () =>
	spawnSync(process.execPath, [join(root, '.scripts', 'localeValidate.cjs')], {
		encoding: 'utf8',
	})

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), 'locale-validation-'))
	mkdirSync(join(root, '.scripts'))
	for (const language of ['en', 'de']) {
		mkdirSync(join(root, 'src', 'resources', language), { recursive: true })
		writeLocale(language, 'app', { title: 'Nominate' })
	}
	for (const file of [
		'.scripts/localeValidate.cjs',
		'.scripts/utils.cjs',
		'src/resourceConfig.json',
	]) {
		copyFileSync(
			new URL(`../../locales/${file}`, import.meta.url),
			join(root, file),
		)
	}
	writeLocale('en', 'chat', { close: 'Close chat', title: 'Guidance chat' })
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

test('English-only namespaces do not require translated files or matching keys', () => {
	expect(validate().status).toBe(0)
	writeLocale('de', 'chat', { title: 'Chat' })
	expect(validate().status).toBe(0)
})

test('translated namespaces still require all files and keys', () => {
	writeLocale('de', 'app', {})
	expect(validate().stderr).toContain(
		'Missing 1 key(s) in locale "de", file "app.json"',
	)
	rmSync(join(root, 'src', 'resources', 'de', 'app.json'))
	const result = validate()
	expect(result.status).toBe(1)
	expect(result.stderr).toContain('Locale "de" is missing file "app.json".')
})

test('English-only source files must still have ordered keys', () => {
	writeLocale('en', 'chat', { title: 'Guidance chat', close: 'Close chat' })
	const result = validate()
	expect(result.status).toBe(1)
	expect(result.stderr).toContain(
		'Keys are in the incorrect order in locale "en", file "chat.json".',
	)
})
