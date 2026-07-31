// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const fs = require('node:fs')
const { join } = require('node:path')

// Project locale directory.
const localeDir = join(__dirname, '..', 'src', 'resources')

// The suffixes of keys related to i18n functionality that should be ignored.
const ignoreSuffixes = ['_one', '_two', '_few', '_many', '_other']

// Check if value is an object. Do not count arrays as objects.
const isObject = (value) =>
	value !== null && typeof value === 'object' && !Array.isArray(value)

// Checks whether a key contains an ingore suffix.
const endsWithIgnoreSuffix = (key) =>
	ignoreSuffixes.some((i) => key.endsWith(i))

// Locale directories, ommitting `en` - the langauge to check missing keys against.
const getDirectories = (source, omit) =>
	fs
		.readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.filter((v) => !omit.includes(v.name))
		.map((dirent) => dirent.name)

// Order keys of a json object.
const orderKeysAlphabetically = (o) =>
	Object.keys(o)
		.sort()
		.reduce((obj, key) => {
			obj[key] = o[key]
			return obj
		}, {})

// Order json object by its keys.
const orderJsonByKeys = (json) => {
	// order top level keys
	json = orderKeysAlphabetically(json)
	// order child objects if they are values.
	const jsonOrdered = {}
	Object.entries(json).forEach(([k, v]) => {
		if (isObject(v)) {
			jsonOrdered[k] = orderJsonByKeys(v)
		} else {
			jsonOrdered[k] = v
		}
	})
	return jsonOrdered
}

// Recursive function to get all keys of a locale object.
const getDeepKeys = (obj) => {
	const keys = []

	for (const [key, value] of Object.entries(obj)) {
		const normalizedKey = endsWithIgnoreSuffix(key)
			? key.slice(0, key.lastIndexOf('_'))
			: key
		if (!keys.includes(normalizedKey)) keys.push(normalizedKey)
		if (isObject(value)) {
			keys.push(...getDeepKeys(value).map((subkey) => `${key}.${subkey}`))
		}
	}

	return keys
}

module.exports = {
	endsWithIgnoreSuffix,
	getDeepKeys,
	getDirectories,
	ignoreSuffixes,
	isObject,
	localeDir,
	orderJsonByKeys,
	orderKeysAlphabetically,
}
