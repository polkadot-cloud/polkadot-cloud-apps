// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const fs = require('node:fs')
const { join } = require('node:path')

// Project locale directory.
const localeDir = join(__dirname, '..', 'src', 'resources')

// The suffixes of keys related to i18n functionality that should be ignored.
const ignoreSuffixes = ['_one', '_two', '_few', '_many', '_other']

// Check if value is an object. Do not count arrays as objects.
const isObject = (o) => (Array.isArray(o) ? false : typeof o === 'object')

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
	let keys = []
	for (const key in obj) {
		let isSubstring = false

		// not number
		if (isNaN(key)) {
			// check if key includes any special substrings
			if (endsWithIgnoreSuffix(key)) {
				isSubstring = true
				// get the substring up to the last underscore
				const rawKey = key.substring(0, key.lastIndexOf('_'))
				// add the key to `keys` if it does not already exist
				if (!keys.includes(rawKey)) {
					keys.push(rawKey)
				}
			}
		}
		// full string, if not already added, go ahead and add
		if (!isSubstring) {
			if (!keys.includes(key)) {
				keys.push(key)
			}
		}
		// if object, recursively get keys
		if (typeof obj[key] === 'object') {
			const subkeys = getDeepKeys(obj[key])
			keys = keys.concat(subkeys.map((subkey) => `${key}.${subkey}`))
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
