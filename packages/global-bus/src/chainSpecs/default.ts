// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainSpec } from 'types'

export const defaultChainSpecs: ChainSpec = {
	genesisHash: '0x',
	properties: {
		isEthereum: false,
		ss58Format: 0,
		tokenDecimals: 0,
		tokenSymbol: '',
	},
	existentialDeposit: 0n,
	version: {
		apis: [],
		authoringVersion: 0,
		implName: '',
		implVersion: 0,
		specName: '',
		specVersion: 0,
		stateVersion: 0,
		transactionVersion: 0,
	},
}
