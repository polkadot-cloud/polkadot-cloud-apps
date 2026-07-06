// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { balanceToPoints } from './balanceToPoints'
import { pendingRewards } from './pendingRewards'
import { pointsToBalance } from './pointsToBalance'

export const runtimeApi = {
	balanceToPoints,
	pendingRewards,
	pointsToBalance,
}
