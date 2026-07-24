// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import {
	LOCALE_NAMES,
	type Locale,
	POLKADOT_CONTEXT,
	SUPPORTED_LOCALES,
} from './constants'
import type { NamespaceFile } from './types'

// Get the workspace root by tracing up from the current file location
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT = join(__dirname, '../../..')

/**
 * Translates text using OpenAI API
 */
export async function translateWithOpenAI(
	text: string,
	targetLocale: Locale,
	description?: string,
	apiKey?: string,
): Promise<string> {
	const key = apiKey || process.env.OPENAI_API_KEY

	if (!key) {
		throw new Error(
			'OpenAI API key not found. Set OPENAI_API_KEY environment variable.',
		)
	}

	const openai = new OpenAI({ apiKey: key })

	const systemPrompt = `You are a professional translator specializing in blockchain and cryptocurrency interfaces. ${POLKADOT_CONTEXT}`

	const userPrompt = `Translate the following text to ${LOCALE_NAMES[targetLocale]}:

Text: "${text}"
${description ? `Context: ${description}` : ''}

Requirements:
- Maintain technical accuracy for blockchain and staking terminology
- Keep the translation natural and user-friendly
- Preserve any special formatting or placeholders (e.g., {{variable}})
- Return ONLY the translated text, no explanations or quotation marks`

	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
		temperature: 0.3,
		max_tokens: 500,
	})

	const translation = response.choices[0]?.message?.content?.trim()
	if (!translation) {
		throw new Error('No translation received from OpenAI')
	}

	return translation
}

/**
 * Reads a locale JSON file
 */
export function readLocaleFile(
	locale: Locale,
	file: NamespaceFile,
	localesPath: string,
): Record<string, unknown> {
	const filePath = join(localesPath, locale, `${file}.json`)
	const content = readFileSync(filePath, 'utf-8')
	return JSON.parse(content)
}

/**
 * Writes to a locale JSON file
 */
export function writeLocaleFile(
	locale: Locale,
	file: NamespaceFile,
	data: Record<string, unknown>,
	localesPath: string,
): void {
	const filePath = join(localesPath, locale, `${file}.json`)
	writeFileSync(filePath, `${JSON.stringify(data, null, '\t')}\n`, 'utf-8')
}

/**
 * Recursively sets a nested key in an object
 * Uses safe property assignment to prevent prototype pollution
 */
export function setNestedKey(
	obj: Record<string, unknown>,
	keyPath: string,
	value: string,
): void {
	const keys = keyPath.split('.')

	// Validate keys to prevent prototype pollution
	const dangerousKeys = ['__proto__', 'constructor', 'prototype']
	for (const key of keys) {
		if (dangerousKeys.includes(key)) {
			throw new Error(
				`Invalid key "${key}" in path "${keyPath}". Keys cannot be __proto__, constructor, or prototype.`,
			)
		}
	}

	let current = obj

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i]

		// Additional check to ensure key is safe
		if (
			!(key in current) ||
			typeof current[key] !== 'object' ||
			current[key] === null
		) {
			// Use Object.defineProperty for safer property creation
			Object.defineProperty(current, key, {
				value: {},
				writable: true,
				enumerable: true,
				configurable: true,
			})
		}

		// Get the next level safely
		const next = current[key]
		// Additional validation before reassignment
		if (typeof next !== 'object' || next === null) {
			throw new Error(
				`Cannot traverse key path "${keyPath}" - invalid structure`,
			)
		}
		current = next as Record<string, unknown>
	}

	const finalKey = keys[keys.length - 1]
	// Use Object.defineProperty for safer property assignment
	// Safe from prototype pollution due to key validation above
	// lgtm[js/prototype-pollution-utility]
	Object.defineProperty(current, finalKey, {
		value,
		writable: true,
		enumerable: true,
		configurable: true,
	})
}

/**
 * Checks if a key already exists in the locale file
 */
export function keyExists(
	data: Record<string, unknown>,
	keyPath: string,
): boolean {
	const keys = keyPath.split('.')
	let current: unknown = data

	for (const key of keys) {
		if (
			typeof current !== 'object' ||
			current === null ||
			!(key in (current as Record<string, unknown>))
		) {
			return false
		}
		current = (current as Record<string, unknown>)[key]
	}

	return true
}

/**
 * Recursively deletes a nested key from an object
 * If a parent object becomes empty after deletion, it is also deleted recursively
 */
export function deleteNestedKey(
	obj: Record<string, unknown>,
	keyPath: string,
): boolean {
	const keys = keyPath.split('.')

	// Validate keys to prevent issues
	const dangerousKeys = ['__proto__', 'constructor', 'prototype']
	for (const key of keys) {
		if (dangerousKeys.includes(key)) {
			throw new Error(
				`Invalid key "${key}" in path "${keyPath}". Keys cannot be __proto__, constructor, or prototype.`,
			)
		}
	}

	// Navigate to the target and record the path
	const path: Array<Record<string, unknown>> = [obj]
	let current: Record<string, unknown> = obj

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i]

		if (typeof current[key] !== 'object' || current[key] === null) {
			return false // Path doesn't exist
		}

		current = current[key] as Record<string, unknown>
		path.push(current)
	}

	// Delete the final key
	const finalKey = keys[keys.length - 1]
	if (!(finalKey in current)) {
		return false
	}

	delete current[finalKey]

	// Clean up empty parent objects from the deepest level upwards
	for (let i = keys.length - 2; i >= 0; i--) {
		const parentObj = path[i]
		const childKey = keys[i]
		const childObj = parentObj[childKey] as Record<string, unknown>

		// If child is now empty, delete it from parent and continue
		if (Object.keys(childObj).length === 0) {
			delete parentObj[childKey]
		} else {
			// Stop if we find a non-empty parent
			break
		}
	}

	return true
}

/**
 * Main function to remove a locale key from all locales
 */
export async function removeLocaleKey(
	key: string,
	file: NamespaceFile,
): Promise<void> {
	const localesPath = join(
		WORKSPACE_ROOT,
		'packages',
		'locales',
		'src',
		'resources',
	)

	console.log(`\nRemoving locale key: ${key}`)
	console.log(`File: ${file}.json`)

	// Remove from all locales
	let removedCount = 0

	for (const locale of SUPPORTED_LOCALES) {
		console.log(`\nRemoving from ${LOCALE_NAMES[locale]} (${locale})...`)

		try {
			const localeData = readLocaleFile(locale, file, localesPath)
			const deleted = deleteNestedKey(localeData, key)

			if (deleted) {
				writeLocaleFile(locale, file, localeData, localesPath)
				console.log(`✓ Removed from ${locale}`)
				removedCount++
			} else {
				console.warn(`⚠ Key not found in ${locale}`)
			}
		} catch (error) {
			console.warn(`⚠ Error processing ${locale}: ${(error as Error).message}`)
		}
	}

	if (removedCount === 0) {
		throw new Error(`Key "${key}" was not found in any locale files.`)
	}

	console.log('\n✓ Key removed from locales!')
	console.log('\nNote: Running pnpm order in locales package...')
}

/**
 * Main function to add a locale key
 */
export async function addLocaleKey(
	key: string,
	text: string,
	file: NamespaceFile,
	description?: string,
	apiKey?: string,
): Promise<void> {
	const localesPath = join(
		WORKSPACE_ROOT,
		'packages',
		'locales',
		'src',
		'resources',
	)

	console.log(`\nAdding locale key: ${key}`)
	console.log(`File: ${file}.json`)
	console.log(`English text: "${text}"`)
	if (description) {
		console.log(`Description: ${description}`)
	}

	// Check if key already exists in English
	const enData = readLocaleFile('en', file, localesPath)
	let addedToEnglish = false

	if (keyExists(enData, key)) {
		console.warn(`⚠ Key already exists in en/${file}.json, skipping English`)
	} else {
		// Add to English first
		console.log('\nAdding to English (en)...')
		setNestedKey(enData, key, text)
		writeLocaleFile('en', file, enData, localesPath)
		console.log('✓ Added to en')
		addedToEnglish = true
	}

	// Translate and add to other locales
	let addedCount = 0
	for (const locale of SUPPORTED_LOCALES) {
		if (locale === 'en') continue

		const localeData = readLocaleFile(locale, file, localesPath)

		// Check if key already exists in this locale
		if (keyExists(localeData, key)) {
			console.warn(
				`⚠ Key already exists in ${locale}/${file}.json, skipping ${locale}`,
			)
			continue
		}

		try {
			console.log(`\nTranslating to ${LOCALE_NAMES[locale]} (${locale})...`)
			const translation = await translateWithOpenAI(
				text,
				locale,
				description,
				apiKey,
			)
			console.log(`Translation: "${translation}"`)

			setNestedKey(localeData, key, translation)
			writeLocaleFile(locale, file, localeData, localesPath)
			console.log(`✓ Added to ${locale}`)
			addedCount++
		} catch (error) {
			console.warn(`⚠ Error adding to ${locale}: ${(error as Error).message}`)
		}
	}

	// Check if we added the key to at least one locale
	if (!addedToEnglish && addedCount === 0) {
		throw new Error(
			`Key "${key}" already exists in all locales. No translations were added.`,
		)
	}

	console.log('\n✓ Translations added successfully!')
	console.log('\nNote: Running pnpm order in locales package...')
}
