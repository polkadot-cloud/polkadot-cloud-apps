// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const transferKeepAlive = <T extends StakingChain>(
	api: DedotClient<T>,
	to: string,
	value: bigint,
) => asTx(api.tx.balances.transferKeepAlive(to, value))
