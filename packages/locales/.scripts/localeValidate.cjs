// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const fs = require('node:fs')
const { join } = require('node:path')
const {
	getDeepKeys,
	getDirectories,
	localeDir,
	orderJsonByKeys,
} = require('./utils.cjs')

// The `en` locale is the source of truth for the full key set.
const DEFAULT_LOCALE = 'en'

// When true, orphaned keys (present in a translation but not in `en`) fail
// validation; otherwise they are reported as warnings. Kept `false` for now so
// CI stays green while pre-existing orphaned keys are cleaned up — flip to
// `true` to enforce parity in both directions going forward.
const ORPHANED_KEYS_FATAL = false

// Read and parse a locale file.
const readLocale = (locale, file) =>
	JSON.parse(fs.readFileSync(join(localeDir, locale, file)).toString())

// Validate that every translation locale has exactly the same key set as `en`:
//   - missing keys (in `en` but not the translation) always fail;
//   - orphaned keys (in the translation but not `en`) fail only when
//     `ORPHANED_KEYS_FATAL` is set, otherwise they are warned about.
// Runs synchronously so failures are deterministic and propagate a non-zero
// exit code (the previous async `fs.readdir` + `throw` combination relied on
// throwing from a callback, which surfaced as an unhandled rejection).
const validateKeyParity = () => {
	const languages = getDirectories(localeDir, [DEFAULT_LOCALE])
	const files = fs.readdirSync(join(localeDir, DEFAULT_LOCALE))

	const errors = []
	const warnings = []

	for (const file of files) {
		const defaultKeys = new Set(getDeepKeys(readLocale(DEFAULT_LOCALE, file)))

		for (const locale of languages) {
			const localeFile = join(localeDir, locale, file)
			if (!fs.existsSync(localeFile)) {
				errors.push(`Locale "${locale}" is missing file "${file}".`)
				continue
			}

			const localeKeys = new Set(getDeepKeys(readLocale(locale, file)))

			const missing = [...defaultKeys].filter((key) => !localeKeys.has(key))
			const orphaned = [...localeKeys].filter((key) => !defaultKeys.has(key))

			if (missing.length > 0) {
				errors.push(
					`Missing ${missing.length} key(s) in locale "${locale}", file "${file}":\n  ${missing.join('\n  ')}`,
				)
			}
			if (orphaned.length > 0) {
				const message = `Orphaned ${orphaned.length} key(s) in locale "${locale}", file "${file}" (not present in "${DEFAULT_LOCALE}"):\n  ${orphaned.join('\n  ')}`
				;(ORPHANED_KEYS_FATAL ? errors : warnings).push(message)
			}
		}
	}

	for (const warning of warnings) {
		console.warn(`⚠ ${warning}`)
	}
	if (errors.length > 0) {
		throw new Error(`Locale key validation failed:\n\n${errors.join('\n\n')}`)
	}
}

// Validate that every locale file has its keys ordered alphabetically.
const validateKeyOrder = () => {
	const locales = getDirectories(localeDir, [])
	const errors = []

	for (const locale of locales) {
		const localePath = join(localeDir, locale)
		for (const file of fs.readdirSync(localePath)) {
			const json = JSON.parse(fs.readFileSync(join(localePath, file)).toString())
			if (JSON.stringify(json) !== JSON.stringify(orderJsonByKeys(json))) {
				errors.push(
					`Keys are in the incorrect order in locale "${locale}", file "${file}".`,
				)
			}
		}
	}

	if (errors.length > 0) {
		throw new Error(`Locale key order validation failed:\n\n${errors.join('\n')}`)
	}
}

try {
	validateKeyParity()
	validateKeyOrder()
	console.log('✓ Locales validated: keys are complete and correctly ordered.')
} catch (error) {
	console.error(error.message)
	process.exit(1)
}
