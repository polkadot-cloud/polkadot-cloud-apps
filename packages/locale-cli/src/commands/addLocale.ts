// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Command } from 'commander'
import { NAMESPACE_FILES } from '../constants'
import { addLocaleKey } from '../index'
import type { NamespaceFile } from '../types'

// Get the workspace root
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT = join(__dirname, '../../../..')

export function registerAddLocaleCommand(program: Command): void {
	program
		.command('add-locale')
		.description(
			'Add a locale key with LLM-powered translations to all supported languages',
		)
		.requiredOption(
			'-k, --key <key>',
			'Locale key to add (e.g., "myKey" or "nested.key")',
		)
		.requiredOption('-t, --text <text>', 'English text to translate')
		.option(
			'-f, --file <file>',
			`Locale file to add the key to (${NAMESPACE_FILES.join(', ')})`,
			'app',
		)
		.option(
			'-d, --description <description>',
			'Optional description for LLM context',
		)
		.option(
			'--api-key <apiKey>',
			'OpenAI API key (or use OPENAI_API_KEY env var)',
		)
		.action(
			async (options: {
				key: string
				text: string
				file: string
				description?: string
				apiKey?: string
			}) => {
				try {
					// Validate file option
					if (!NAMESPACE_FILES.includes(options.file as NamespaceFile)) {
						console.error(
							`Error: Invalid file "${options.file}". Must be one of: ${NAMESPACE_FILES.join(', ')}`,
						)
						process.exit(1)
					}

					// Add the locale key
					await addLocaleKey(
						options.key,
						options.text,
						options.file as NamespaceFile,
						options.description,
						options.apiKey,
					)

					// Run pnpm order
					console.log('\nRunning pnpm order...')
					try {
						execSync('pnpm order', {
							cwd: join(WORKSPACE_ROOT, 'packages/locales'),
							stdio: 'inherit',
						})
						console.log('✓ pnpm order completed')
					} catch (error) {
						console.error('Error running pnpm order:', error)
						process.exit(1)
					}

					console.log(
						'\n✓ All done! The locale key has been added successfully.',
					)
				} catch (error) {
					console.error('\nError:', (error as Error).message)
					process.exit(1)
				}
			},
		)
}
