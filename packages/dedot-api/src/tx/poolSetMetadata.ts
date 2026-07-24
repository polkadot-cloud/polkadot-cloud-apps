// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { BytesLike } from 'dedot/codecs'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolSetMetadata = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
	metadata: BytesLike,
) => asTx(api.tx.nominationPools.setMetadata(poolId, metadata))
