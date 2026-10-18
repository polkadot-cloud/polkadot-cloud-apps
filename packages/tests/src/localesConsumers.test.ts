// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { readdirSync, readFileSync } from 'node:fs'
import ts from 'typescript'
import { expect, test } from 'vitest'
import { createInstance } from '../../locales/node_modules/i18next/index.js'
import { normalizeResources } from '../../locales/src/util/cache'
import { getLedgerMessageKey } from '../../locales/src/util/ledger'

const resourceDirectory = new URL(
	'../../locales/src/resources/',
	import.meta.url,
)
const languages = readdirSync(resourceDirectory)
const resources = Object.fromEntries(
	languages.map((language) => [
		language,
		Object.assign(
			{},
			...['app', 'modals', 'pages'].map((namespace) =>
				JSON.parse(
					readFileSync(
						new URL(`${language}/${namespace}.json`, resourceDirectory),
						'utf8',
					),
				),
			),
		),
	]),
)

test.each(languages)(
	'normalization preserves every existing %s translation and plural form',
	(lng) => {
		const profileResources = Object.assign(
			{},
			...['app', 'modals', 'pages', 'help', 'tips', 'swap'].map((namespace) =>
				JSON.parse(
					readFileSync(
						new URL(`${lng}/${namespace}.json`, resourceDirectory),
						'utf8',
					),
				),
			),
		)
		const fallback = Object.assign(
			{},
			...['app', 'modals', 'pages', 'help', 'tips', 'swap'].map((namespace) =>
				JSON.parse(
					readFileSync(
						new URL(`en/${namespace}.json`, resourceDirectory),
						'utf8',
					),
				),
			),
		)
		expect(normalizeResources(profileResources, fallback)).toEqual(
			profileResources,
		)
	},
)

test.each(languages)(
	'routes Ledger modal message codes to existing %s translations',
	async (lng) => {
		const i18n = createInstance()
		await i18n.init({ lng, fallbackLng: false, resources })
		const t = i18n.getFixedT(lng, 'app')
		for (const code of [
			'methodNotSupported',
			'missingNesting',
			'queuedTransactionRejected',
		]) {
			expect(t(getLedgerMessageKey(code))).toBe(resources[lng].modals[code])
			expect(t(getLedgerMessageKey(code), { ns: 'app' })).toBe(
				resources[lng].modals[code],
			)
		}
		expect(getLedgerMessageKey('ledgerRequestTimeout')).toBe(
			'ledgerRequestTimeout',
		)
		expect(getLedgerMessageKey('Send Assets')).toBe('Send Assets')
	},
)

// Check the actual calls in the corrected consumers, including their bound/default namespace.
test.each([
	'app-staking/src/library/Countdown/index.tsx',
	'app-staking/src/modals/JoinPool/Form.tsx',
	'app-staking/src/hooks/useActiveAccountPool/index.tsx',
	'app-staking/src/pages/Rewards/Overview/IncomingPayouts.tsx',
])(
	'literal translations in %s resolve in every supported language',
	async (file) => {
		const path = new URL(`../../${file}`, import.meta.url)
		const source = ts.createSourceFile(
			file,
			readFileSync(path, 'utf8'),
			ts.ScriptTarget.Latest,
			true,
		)
		const calls: ts.CallExpression[] = []
		const visit = (node: ts.Node) => {
			if (ts.isCallExpression(node)) calls.push(node)
			ts.forEachChild(node, visit)
		}
		visit(source)
		const hook = calls.find(
			(call) => call.expression.getText(source) === 'useTranslation',
		)
		const namespace = hook?.arguments[0]
		const defaultNamespace =
			namespace && ts.isStringLiteral(namespace)
				? namespace.text
				: namespace &&
						ts.isArrayLiteralExpression(namespace) &&
						ts.isStringLiteral(namespace.elements[0])
					? namespace.elements[0].text
					: 'translation'
		const i18n = createInstance()
		await i18n.init({ lng: 'en', fallbackLng: false, resources })
		const literals = calls.filter(
			(call) =>
				call.expression.getText(source) === 't' &&
				ts.isStringLiteral(call.arguments[0]),
		)
		expect(literals.length).toBeGreaterThan(0)
		for (const call of literals) {
			const key = (call.arguments[0] as ts.StringLiteral).text
			let ns = defaultNamespace
			const options = call.arguments[1]
			if (options && ts.isObjectLiteralExpression(options)) {
				for (const property of options.properties) {
					if (
						ts.isPropertyAssignment(property) &&
						property.name.getText(source) === 'ns' &&
						ts.isStringLiteral(property.initializer)
					)
						ns = property.initializer.text
				}
			}
			for (const lng of languages) {
				for (const count of [0, 1, 2, 5]) {
					expect(
						i18n.exists(key, { lng, ns, count }),
						`${lng}/${ns}:${key} count=${count}`,
					).toBe(true)
				}
			}
		}
	},
)
