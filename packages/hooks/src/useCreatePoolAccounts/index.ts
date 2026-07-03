// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChain } from 'consts/util'
import { createPoolAccounts as createUtil } from 'utils'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'

export const useCreatePoolAccounts = () => {
	const { network } = useNetwork()
	const { getChainSpec, getConsts } = useApi()
	const { poolsPalletId } = getConsts(network)
	const { ss58Format } = getChainSpec(getStakingChain(network)).properties

	const createPoolAccounts = (poolId: number) =>
		createUtil(poolId, poolsPalletId, ss58Format)

	return createPoolAccounts
}
