// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StakerNominationStatus } from 'plugin-staking-api/types'

export interface ActiveStakerHookInterface {
	activePoolStatus: StakerNominationStatus | undefined
	activeNominatorStatus: StakerNominationStatus | undefined
}
