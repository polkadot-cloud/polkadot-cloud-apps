// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConnectProvider } from '@polkadot-cloud/connect'
import { LedgerAdaptor } from '@polkadot-cloud/connect-ledger'
import { createProxiesAdaptor } from '@polkadot-cloud/connect-proxies'
import { withProviders } from '@w3ux/factories'
import { ValidatorsDappName } from 'consts'
import { getStakingChainData } from 'consts/util'
import { EraStakersProvider } from 'contexts/EraStakers'
import { FiltersProvider } from 'contexts/Filters'
import { ValidatorsProvider } from 'contexts/Validators/ValidatorEntries'
import { useNetwork } from 'hooks/useNetwork'
import { Tooltip } from 'radix-ui'
import { OverlayProvider } from 'ui-overlay'
import { ThemedRouter } from './Themes'

export const Providers = () => {
	const { network } = useNetwork()
	const { ss58 } = getStakingChainData(network)

	return withProviders(
		// Provider order matters: validator state consumes era-staker state.
		[
			OverlayProvider,
			[
				ConnectProvider,
				{
					network,
					dappName: ValidatorsDappName,
					ss58,
					adaptors: [LedgerAdaptor, createProxiesAdaptor(network)],
				},
			],
			EraStakersProvider,
			ValidatorsProvider,
			FiltersProvider,
			Tooltip.Provider,
		],
		ThemedRouter,
	)
}
