// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PalletNominationPoolsPoolState } from 'dedot/chaintypes'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolSetState = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
	state: PalletNominationPoolsPoolState,
) => asTx(api.tx.nominationPools.setState(poolId, state))
