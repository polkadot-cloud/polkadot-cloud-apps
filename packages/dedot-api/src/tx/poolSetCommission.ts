// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolSetCommission = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
	commission?: [number, string],
) => asTx(api.tx.nominationPools.setCommission(poolId, commission))
