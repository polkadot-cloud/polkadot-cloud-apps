// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConnectProvider } from '@polkadot-cloud/connect'
import { LedgerAdaptor } from '@polkadot-cloud/connect-ledger'
import { StablecoinsDappName } from 'consts'
import { Tooltip } from 'radix-ui'
import { HashRouter } from 'react-router-dom'
import { OverlayProvider } from 'ui-overlay'
import { ThemedRouter } from './Themes'

const network = 'polkadot'
const ss58 = 0

export const Providers = () => (
	<ConnectProvider
		network={network}
		dappName={StablecoinsDappName}
		ss58={ss58}
		adaptors={[LedgerAdaptor]}
	>
		<HashRouter basename="/">
			<OverlayProvider>
				<Tooltip.Provider>
					<ThemedRouter />
				</Tooltip.Provider>
			</OverlayProvider>
		</HashRouter>
	</ConnectProvider>
)
