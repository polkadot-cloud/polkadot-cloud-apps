// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getExtensionIcon } from 'assets'
import LedgerSVG from 'assets/extensions/LedgerSquare.svg?react'
import PolkadotVaultSVG from 'assets/extensions/PolkadotVault.svg?react'

export const getAccountSourceIcon = (source?: string) => {
	if (!source) return undefined
	if (source === 'ledger') return LedgerSVG
	if (source === 'vault') return PolkadotVaultSVG
	return getExtensionIcon(source) || undefined
}
