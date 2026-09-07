// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useTokenPrice } from 'data-gate/react'
import { formatTokenPrice } from 'plugin-staking-api'
import { useCurrency } from '../useCurrency'
import { useNetwork } from '../useNetwork'
import { defaultTokenPrice } from './defaults'
import type { TokenPricesHookInterface } from './types'

export { defaultTokenPrice } from './defaults'
export type { TokenPricesHookInterface } from './types'

export const useTokenPrices = (): TokenPricesHookInterface => {
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { unit } = getStakingChainData(network)
	const result = useTokenPrice(
		`${unit}${currency}${currency === 'USD' ? 'T' : ''}`,
	)
	return result.data
		? formatTokenPrice(result.data.price, result.data.change)
		: defaultTokenPrice
}
