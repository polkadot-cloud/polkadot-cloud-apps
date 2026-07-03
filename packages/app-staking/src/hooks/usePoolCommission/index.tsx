// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useApi } from 'hooks/useApi'

export const usePoolCommission = () => {
	const { getBondedPool } = useBondedPools()
	const { globalMaxCommission } = useApi().poolsConfig

	const getCurrentCommission = (id: number): number =>
		Math.min(
			Number(getBondedPool(id)?.commission?.current?.[0] || 0),
			globalMaxCommission,
		)

	return { getCurrentCommission }
}
