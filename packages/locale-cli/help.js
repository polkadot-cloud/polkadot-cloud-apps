#!/usr/bin/env node
// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Script to demonstrate CLI functionality
// This shows the structure and flow of the CLI

console.log('=== Locale CLI Help ===\n')

console.log('Available Commands:\n')

console.log('ADD-LOCALE: Add a new locale key with translations')
console.log('Usage: pnpm add-locale [options]')
console.log('Aliases: pnpm --filter locale-cli add-locale\n')

console.log('Examples:')
console.log('  1. Basic usage:')
console.log("     pnpm add-locale --key myKey --text 'My Text'\n")

console.log('  2. With nested key:')
console.log(
	"     pnpm add-locale --key 'validators.commission' --text 'Commission'\n",
)

console.log('  3. With custom file:')
console.log("     pnpm add-locale --key myKey --text 'My Text' --file help\n")

console.log('  4. With description for better context:')
console.log(
	"     pnpm add-locale --key bondMore --text 'Bond More' --description 'Button to bond additional funds'\n",
)

console.log('  5. With API key option:')
console.log(
	"     pnpm add-locale --key myKey --text 'My Text' --api-key sk-...\n",
)

console.log('\n---\n')

console.log('REMOVE-LOCALE: Remove a locale key from all supported languages')
console.log('Usage: pnpm remove-locale [options]')
console.log('Aliases: pnpm --filter locale-cli remove-locale\n')

console.log('Examples:')
console.log('  1. Remove a key from default app.json:')
console.log('     pnpm remove-locale --key myKey\n')

console.log('  2. Remove a nested key:')
console.log("     pnpm remove-locale --key 'validators.commission'\n")

console.log('  3. Remove from a specific file:')
console.log('     pnpm remove-locale --key myKey --file help\n')

console.log('\n---\n')

console.log(
	'Note: You need to set OPENAI_API_KEY environment variable or use --api-key option',
)
console.log('      when running the add-locale command.\n')

console.log('Available locale files:')
console.log('  - app (default)')
console.log('  - help')
console.log('  - modals')
console.log('  - pages')
console.log('  - tips')

console.log('\nSupported languages:')
console.log('  - English (en)')
console.log('  - Spanish (es)')
console.log('  - Chinese Simplified (zh)')
