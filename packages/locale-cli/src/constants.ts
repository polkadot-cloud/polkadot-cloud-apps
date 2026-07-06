// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localeDefinitions } from 'consts/locales'
export type Locale = keyof typeof localeDefinitions

// Supported locales
export const SUPPORTED_LOCALES = Object.keys(
	localeDefinitions,
) as (keyof typeof localeDefinitions)[]

// Locale names for LLM context
export const LOCALE_NAMES: Record<Locale, string> = Object.fromEntries(
	Object.entries(localeDefinitions).map(([key, value]) => [key, value.label]),
) as Record<Locale, string>

// Available namespace files
export const NAMESPACE_FILES = [
	'app',
	'help',
	'modals',
	'pages',
	'tips',
] as const

// Context about Polkadot and the staking dashboard
export const POLKADOT_CONTEXT = `
Polkadot is a blockchain platform that enables multiple specialized blockchains to interoperate in a shared security model. It uses a Nominated Proof-of-Stake (NPoS) consensus mechanism.

The Polkadot Staking Dashboard is a web application that allows users to:
- Stake their DOT tokens by nominating validators
- Join nomination pools for collective staking
- Monitor their staking rewards and performance
- Manage their bonded funds and nominations
- Track validator performance and commission rates

Key staking concepts:
- Validators: Nodes that validate blocks and secure the network
- Nominators: Token holders who back validators with their stake
- Nomination Pools: Allow users to pool their stake together
- Commission: The percentage validators take from staking rewards
- Bonding: Locking tokens for staking (with an unbonding period)
- Era: A time period in Polkadot (approximately 24 hours)

When translating, maintain technical accuracy for blockchain and staking terminology while making the interface accessible to users.
`
