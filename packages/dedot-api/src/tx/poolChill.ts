// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolChill = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
) => asTx(api.tx.nominationPools.chill(poolId))
