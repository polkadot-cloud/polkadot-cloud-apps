// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getNetworkKnownPoolIds } from 'consts/util/pools'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNetwork } from 'hooks/useNetwork'
import { useState } from 'react'
import { Close } from 'ui-overlay'
import { Form } from './Form'

export const JoinPool = () => {
	const { network } = useNetwork()
	const { poolsMetaData, bondedPools } = useBondedPools()

	const poolIds = getNetworkKnownPoolIds(network)

	// The selected bonded pool id
	const [selectedPoolId] = useState<number>(
		poolIds.length > 0
			? poolIds[Math.floor(Math.random() * poolIds.length)]
			: // Fallback to any bonded pool if no known pool ids are given
				bondedPools[Math.floor(Math.random() * bondedPools.length)]?.id || 1,
	)

	const metadata = poolsMetaData[selectedPoolId]
	const bondedPool = bondedPools.find((pool) => pool.id === selectedPoolId)

	if (!bondedPool) {
		return null
	}

	return (
		<>
			<Close />
			<Form bondedPool={bondedPool} metadata={metadata} />
		</>
	)
}
