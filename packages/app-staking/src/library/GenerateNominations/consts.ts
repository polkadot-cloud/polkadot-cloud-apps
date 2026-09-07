// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorWarningType } from 'plugin-staking-api/types'

// Add each sunsetting warning enum and its operator-specific message here.
export const SunsettingWarnings: {
	type: ValidatorWarningType
	messageKey: string
}[] = [{ type: 'ZUG_VALIDATOR', messageKey: 'zugValidatorWarning' }]
