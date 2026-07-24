// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { BondedPoolQuery } from 'types'
import type { StakingChain } from '../types'

export const bondedPool = async <T extends StakingChain>(
	api: DedotClient<T>,
	poolId: number,
): Promise<BondedPoolQuery | undefined> => {
	const result = await api.query.nominationPools.bondedPools(poolId)
	if (result === undefined) {
		return undefined
	}

	const current: [number, string] | undefined = result.commission.current
		? [
				result.commission.current[0],
				result.commission.current[1].address(api.consts.system.ss58Prefix),
			]
		: undefined

	return {
		...result,
		roles: {
			depositor: result?.roles.depositor.address(api.consts.system.ss58Prefix),
			nominator: result?.roles.nominator?.address(api.consts.system.ss58Prefix),
			root: result?.roles.root?.address(api.consts.system.ss58Prefix),
			bouncer: result?.roles.bouncer?.address(api.consts.system.ss58Prefix),
		},
		commission: {
			...result.commission,
			current,
		},
	}
}
