// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { AccountId32 } from 'dedot/codecs'
import type { PoolRoles } from 'types'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const poolUpdateRoles = <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
	roles: PoolRoles,
) =>
	asTx(
		api.tx.nominationPools.updateRoles(
			poolId,
			roles?.root
				? { type: 'Set', value: new AccountId32(roles.root) }
				: { type: 'Remove' },
			roles.nominator
				? { type: 'Set', value: new AccountId32(roles.nominator) }
				: { type: 'Remove' },
			roles.bouncer
				? { type: 'Set', value: new AccountId32(roles.bouncer) }
				: { type: 'Remove' },
		),
	)
