// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUnclaimedRewards } from 'data-gate/react'
import { useApi } from 'hooks/useApi'
import { defaultUnclaimedRewards, usePayouts } from 'hooks/usePayouts'
import { useEffect } from 'react'
import type { Props } from './types'

export const UnclaimedRewardsApi = ({ who, network }: Props) => {
	const { activeEra } = useApi()
	const { setUnclaimedRewards } = usePayouts()
	const { data, loading, error } = useUnclaimedRewards({
		network,
		who,
		fromEra: Math.max(activeEra.index - 1, 0),
	})

	useEffect(() => {
		setUnclaimedRewards(
			!loading && !error ? data.unclaimedRewards : defaultUnclaimedRewards,
		)
		return () => setUnclaimedRewards(defaultUnclaimedRewards)
	}, [network, who, loading, error, data.unclaimedRewards, setUnclaimedRewards])

	return null
}
