// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import dotenv from 'dotenv'
import { registerAddLocaleCommand } from './commands/addLocale'
import { registerRemoveLocaleCommand } from './commands/removeLocale'

// Get the workspace root by tracing up from the current file location
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT = join(__dirname, '../../..')

// Load environment variables from workspace root .env file
dotenv.config({ path: join(WORKSPACE_ROOT, '.env') })

const program = new Command()

program
	.name('locale-cli')
	.description('CLI tool for managing locale keys and translations')
	.version('1.0.0')

// Register commands
registerAddLocaleCommand(program)
registerRemoveLocaleCommand(program)

program.parse()
