// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorEntry } from '@w3ux/validator-assets'

export interface OperatorsHookInterface {
	validatorOperators: ValidatorEntry[]
	getNetworkOperators: (network: string) => ValidatorEntry[]
}
