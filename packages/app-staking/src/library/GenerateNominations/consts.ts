// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorWarningType } from 'plugin-staking-api/types'

// Map each validator warning code to its message, highest severity first.
export const ValidatorWarningDefinitions: {
	type: ValidatorWarningType
	messageKey: string
	severity: 'danger' | 'warning'
}[] = [
	{
		type: 'ZUG_VALIDATOR',
		messageKey: 'zugValidatorWarning',
		severity: 'danger',
	},
	{
		type: 'HETZNER',
		messageKey: 'hetznerValidatorWarning',
		severity: 'warning',
	},
]
