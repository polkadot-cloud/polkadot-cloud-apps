// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FunctionComponent, SVGProps } from 'react'
import type { ChainIcons, NetworkId } from 'types'
import { chainIcons } from './chains'
import Ledger from './extensions/Ledger.svg?react'
import PolkadotJs from './extensions/PolkadotJs.svg?react'
import PolkadotVault from './extensions/PolkadotVault.svg?react'
import SubWalletJs from './extensions/SubWalletJs.svg?react'
import Talisman from './extensions/Talisman.svg?react'

type ExtensionIcon = FunctionComponent<SVGProps<SVGSVGElement>>

const extensionIcons: Record<string, ExtensionIcon> = {
	ledger: Ledger,
	'polkadot-js': PolkadotJs,
	polkadotvault: PolkadotVault,
	'subwallet-js': SubWalletJs,
	talisman: Talisman,
}

// Get chain icons as a record of React components
export const getChainIcons = (name: NetworkId): ChainIcons => chainIcons[name]

export const getExtensionIcon = (id: string): ExtensionIcon | null =>
	extensionIcons[id] || null
