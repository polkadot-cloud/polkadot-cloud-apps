// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getRelayChainConsts } from 'consts/util'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'

export const useErasPerDay = () => {
	const { getConsts } = useApi()
	const { network } = useNetwork()
	const { sessionsPerEra, historyDepth } = getConsts(network)
	const { epochDuration, expectedBlockTime } = getRelayChainConsts(network)

	const DAY_MS = new BigNumber(86400000)

	// Calculates how many eras there are in a 24 hour period.
	const getErasPerDay = (): number => {
		if (
			epochDuration === 0n ||
			sessionsPerEra === 0 ||
			expectedBlockTime === 0n
		) {
			return 0
		}

		const blocksPerEra = epochDuration * BigInt(sessionsPerEra)
		const msPerEra = blocksPerEra * expectedBlockTime

		return Number(DAY_MS.dividedBy(msPerEra))
	}

	return {
		erasPerDay: getErasPerDay(),
		maxSupportedDays: historyDepth === 0 ? 0 : historyDepth / getErasPerDay(),
	}
}
