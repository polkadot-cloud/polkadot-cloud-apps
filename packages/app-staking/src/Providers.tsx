// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ThemedRouter } from 'Themes'
import { ConnectProvider } from '@polkadot-cloud/connect'
import { LedgerAdaptor } from '@polkadot-cloud/connect-ledger'
import { createProxiesAdaptor } from '@polkadot-cloud/connect-proxies'
import { withProviders } from '@w3ux/factories'
import { StakingDappName } from 'consts'
import { getStakingChainData } from 'consts/util'
import { EraStakersProvider } from 'contexts/EraStakers'
import { FiltersProvider } from 'contexts/Filters'
import { MigrateProvider } from 'contexts/Migrate'
import { NominatorSetupsProvider } from 'contexts/NominatorSetups'
import { BondedPoolsProvider } from 'contexts/Pools/BondedPools'
import { ValidatorsProvider } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { Tooltip } from 'radix-ui'
import { OverlayProvider } from 'ui-overlay'

export const Providers = () => {
	const { network } = useNetwork()
	const { ss58 } = getStakingChainData(network)

	return withProviders(
		// !! Provider order matters.
		[
			OverlayProvider,
			[
				ConnectProvider,
				{
					network,
					dappName: StakingDappName,
					ss58,
					adaptors: [LedgerAdaptor, createProxiesAdaptor(network)],
				},
			],
			EraStakersProvider,
			BondedPoolsProvider,
			ValidatorsProvider,
			NominatorSetupsProvider,
			MigrateProvider,
			FiltersProvider,
			Tooltip.Provider,
		],
		ThemedRouter,
	)
}
