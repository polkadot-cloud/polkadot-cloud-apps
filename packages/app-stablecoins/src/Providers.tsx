// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConnectProvider } from '@polkadot-cloud/connect'
import { LedgerAdaptor } from '@polkadot-cloud/connect-ledger'
import { StablecoinsDappName } from 'consts'
import { UIProvider } from 'contexts/UI'
import { Tooltip } from 'radix-ui'
import { BrowserRouter } from 'react-router-dom'
import { OverlayProvider } from 'ui-overlay'
import { ThemedRouter } from './Themes'

const Network = 'polkadot'
const PolkadotSs58 = 0

export const Providers = () => (
	<ConnectProvider
		network={Network}
		dappName={StablecoinsDappName}
		ss58={PolkadotSs58}
		adaptors={[LedgerAdaptor]}
	>
		<UIProvider>
			<BrowserRouter>
				<OverlayProvider>
					<Tooltip.Provider>
						<ThemedRouter />
					</Tooltip.Provider>
				</OverlayProvider>
			</BrowserRouter>
		</UIProvider>
	</ConnectProvider>
)
