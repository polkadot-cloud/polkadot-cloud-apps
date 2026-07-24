// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Command } from 'commander'
import { NAMESPACE_FILES } from '../constants'
import { removeLocaleKey } from '../index'
import type { NamespaceFile } from '../types'

// Get the workspace root
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT = join(__dirname, '../../../..')

export function registerRemoveLocaleCommand(program: Command): void {
	program
		.command('remove-locale')
		.description('Remove a locale key from all supported languages')
		.requiredOption(
			'-k, --key <key>',
			'Locale key to remove (e.g., "myKey" or "nested.key")',
		)
		.option(
			'-f, --file <file>',
			`Locale file to remove the key from (${NAMESPACE_FILES.join(', ')})`,
			'app',
		)
		.action(async (options: { key: string; file: string }) => {
			try {
				// Validate file option
				if (!NAMESPACE_FILES.includes(options.file as NamespaceFile)) {
					console.error(
						`Error: Invalid file "${options.file}". Must be one of: ${NAMESPACE_FILES.join(', ')}`,
					)
					process.exit(1)
				}

				// Remove the locale key
				await removeLocaleKey(options.key, options.file as NamespaceFile)

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
					'\n✓ All done! The locale key has been removed successfully.',
				)
			} catch (error) {
				console.error('\nError:', (error as Error).message)
				process.exit(1)
			}
		})
}
