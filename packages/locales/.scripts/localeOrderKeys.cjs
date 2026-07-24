// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

const fs = require('node:fs')
const path = require('node:path')
const prettier = require('prettier')
const { getDirectories, localeDir, orderJsonByKeys } = require('./utils.cjs')

// Get all language paths to re-order.
const languages = getDirectories(localeDir, [])

// Gor each language path.
for (const lng of languages) {
	const pathToLanguage = path.join(localeDir, `/${lng}`)

	fs.readdir(pathToLanguage, (error, files) => {
		if (error) {
			return
		}

		files.forEach(async (file) => {
			const pathToFile = path.join(pathToLanguage, file)
			const json = JSON.parse(fs.readFileSync(pathToFile).toString())

			// order json object alphabetically.
			const orderedJson = orderJsonByKeys(json)

			// format json object.
			const formatted = await prettier.format(JSON.stringify(orderedJson), {
				useTabs: true,
				parser: 'json',
			})

			fs.writeFile(pathToFile, formatted, (err) => {
				if (err) {
					console.err(err)
				} else {
					console.log(
						`----------Keys In ${pathToLanguage}/${file} Are Ordered Alphabetically-------------`,
					)
				}
			})
		})
	})
}
