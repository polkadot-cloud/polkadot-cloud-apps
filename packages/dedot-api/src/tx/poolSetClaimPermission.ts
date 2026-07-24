// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { ClaimPermission } from 'types'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolSetClaimPermission = <T extends StakingChain>(
	api: DedotClient<T>,
	claimPermission: ClaimPermission,
) => asTx(api.tx.nominationPools.setClaimPermission(claimPermission))
