// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { StakingApiRetainmentSupportedNetworks } from 'consts/plugins'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'

export const useRetainmentStatsEnabled = () => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()

	return (
		pluginEnabled('staking_api') &&
		StakingApiRetainmentSupportedNetworks.includes(network)
	)
}
