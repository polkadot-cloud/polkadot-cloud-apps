// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { StakingChain } from '../types'

export const pendingRewards = async <T extends StakingChain>(
	api: DedotClient<T>,
	address: string,
) => await api.call.nominationPoolsApi.pendingRewards(address)
