// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PalletStakingValidatorPrefs } from 'dedot/chaintypes'
import type { StakingChain } from '../types'

export const validatorEntries = async <T extends StakingChain>(
	api: DedotClient<T>,
): Promise<[string, PalletStakingValidatorPrefs][]> => {
	const result = await api.query.staking.validators.entries()

	return result.map(([key, value]) => [
		key.address(api.consts.system.ss58Prefix),
		value,
	])
}
