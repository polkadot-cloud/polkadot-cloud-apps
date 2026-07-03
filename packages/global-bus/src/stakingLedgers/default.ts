// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StakingLedger } from 'types'

export const defaultStakingLedger: StakingLedger = {
	ledger: undefined,
	payee: undefined,
	nominators: undefined,
	controllerUnmigrated: false,
}
