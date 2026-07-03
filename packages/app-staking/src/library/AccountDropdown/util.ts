// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import LedgerSVG from '@w3ux/extension-assets/LedgerSquare.svg?react'
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react'
import { ExtensionIcons } from '@w3ux/extension-assets/util'
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react'

export const getAccountSourceIcon = (source?: string) => {
	const SelectedIcon = source
		? source === 'ledger'
			? LedgerSVG
			: source === 'vault'
				? PolkadotVaultSVG
				: source === 'wallet_connect'
					? WalletConnectSVG
					: ExtensionIcons[source] || undefined
		: undefined

	return SelectedIcon
}
