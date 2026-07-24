// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveStatusWithNominees } from 'plugin-staking-api/types'

export interface ActiveStakerHookInterface {
	activePoolData: ActiveStatusWithNominees | null | undefined
	activeNominatorData: ActiveStatusWithNominees | null | undefined
}
