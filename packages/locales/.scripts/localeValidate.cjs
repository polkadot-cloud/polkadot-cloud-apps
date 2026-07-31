// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const { readFileSync, readdirSync } = require('node:fs')
const { join } = require('node:path')
const {
	getDeepKeys,
	getDirectories,
	localeDir,
	orderJsonByKeys,
} = require('./utils.cjs')

const SOURCE_LOCALE = 'en'
const locales = getDirectories(localeDir, [])
const translations = locales.filter((locale) => locale !== SOURCE_LOCALE)

const localePath = (...parts) => join(localeDir, ...parts)
const readLocale = (...parts) =>
	JSON.parse(readFileSync(localePath(...parts), 'utf8'))
const getKeys = (...parts) => new Set(getDeepKeys(readLocale(...parts)))
const difference = (from, to) => [...from].filter((key) => !to.has(key))
const formatKeyError = (type, keys, locale, file) =>
	`${type} ${keys.length} key(s) in locale "${locale}", file "${file}":\n  ${keys.join('\n  ')}`

const getKeyParityErrors = () => {
	const errors = []
	const sourceFiles = new Map(
		readdirSync(localePath(SOURCE_LOCALE)).map((file) => [
			file,
			getKeys(SOURCE_LOCALE, file),
		]),
	)

	for (const locale of translations) {
		const localeFiles = new Set(readdirSync(localePath(locale)))

		for (const file of difference(sourceFiles.keys(), localeFiles)) {
			errors.push(`Locale "${locale}" is missing file "${file}".`)
		}
		for (const file of difference(localeFiles, sourceFiles)) {
			errors.push(`Locale "${locale}" has orphaned file "${file}".`)
		}

		for (const [file, sourceKeys] of sourceFiles) {
			if (!localeFiles.has(file)) continue
			const localeKeys = getKeys(locale, file)
			for (const [type, keys] of [
				['Missing', difference(sourceKeys, localeKeys)],
				['Orphaned', difference(localeKeys, sourceKeys)],
			]) {
				if (keys.length) errors.push(formatKeyError(type, keys, locale, file))
			}
		}
	}

	return errors
}

const getKeyOrderErrors = () => {
	const errors = []

	for (const locale of locales) {
		for (const file of readdirSync(localePath(locale))) {
			const json = readLocale(locale, file)
			if (JSON.stringify(json) !== JSON.stringify(orderJsonByKeys(json))) {
				errors.push(
					`Keys are in the incorrect order in locale "${locale}", file "${file}".`,
				)
			}
		}
	}

	return errors
}

const errors = [...getKeyParityErrors(), ...getKeyOrderErrors()]

if (errors.length) {
	console.error(`Locale validation failed:\n\n${errors.join('\n\n')}`)
	process.exitCode = 1
} else {
	console.log('✓ Locales validated: keys are complete and correctly ordered.')
}
