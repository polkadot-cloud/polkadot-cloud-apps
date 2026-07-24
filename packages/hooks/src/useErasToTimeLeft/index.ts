// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getRelayChainConsts } from 'consts/util'
import { useApi } from '../useApi'
import { useNetwork } from '../useNetwork'

export const useErasToTimeLeft = () => {
	const { getConsts } = useApi()
	const { network } = useNetwork()
	const { sessionsPerEra } = getConsts(network)
	const { epochDuration, expectedBlockTime } = getRelayChainConsts(network)

	// Converts a number of eras to timeleft in seconds
	const erasToSeconds = (eras: bigint | number): number => {
		if (eras <= 0) {
			return 0
		}
		// Store the duration of an era in number of blocks
		const eraDurationBlocks = epochDuration * BigInt(sessionsPerEra)
		// estimate the duration of the era in seconds.
		const eraDuration = (eraDurationBlocks * expectedBlockTime) / 1000n
		// Multiply by number of eras
		return Number(eras) * Number(eraDuration)
	}

	return {
		erasToSeconds,
	}
}
