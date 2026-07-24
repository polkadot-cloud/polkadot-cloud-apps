// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { resetActiveProxy, resetProxies } from '@polkadot-cloud/connect-proxies'
import {
	resetAccountBalances,
	resetActiveEra,
	resetActivePoolIds,
	resetActivePools,
	resetApiStatus,
	resetBlockNumber,
	resetBonded,
	resetChainSpecs,
	resetConsts,
	resetEraRewardPoints,
	resetPoolMemberships,
	resetPoolRoleIdentities,
	resetPoolsConfig,
	resetPoolWarnings,
	resetServiceInterface,
	resetStablecoinBalances,
	resetStakingLedgers,
	resetStakingMetrics,
} from 'global-bus'

export const onNetworkReset = () => {
	resetActivePools()
	resetActivePoolIds()
	resetPoolRoleIdentities()
	resetPoolWarnings()

	resetAccountBalances()
	resetStablecoinBalances()
	resetPoolMemberships()
	resetStakingLedgers()
	resetBonded()
	resetProxies()
	resetActiveProxy()

	resetBlockNumber()
	resetActiveEra()
	resetEraRewardPoints()

	resetApiStatus()
	resetStakingMetrics()
	resetPoolsConfig()
	resetServiceInterface()

	resetChainSpecs()
	resetConsts()
}
