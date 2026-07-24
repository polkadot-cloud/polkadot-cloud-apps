// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolUnbond = <T extends StakingChain>(
	api: DedotClient<T>,
	who: string,
	points: bigint,
) => asTx(api.tx.nominationPools.unbond(who, points))
