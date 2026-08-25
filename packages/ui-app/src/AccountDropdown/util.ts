// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getExtensionIcon } from 'assets'
import LedgerSVG from 'assets/extensions/LedgerSquare.svg?react'
import PolkadotVaultSVG from 'assets/extensions/PolkadotVault.svg?react'

export const getAccountSourceIcon = (source?: string) => {
	const SelectedIcon = source
		? source === 'ledger'
			? LedgerSVG
			: source === 'vault'
				? PolkadotVaultSVG
				: getExtensionIcon(source) || undefined
		: undefined

	return SelectedIcon
}
