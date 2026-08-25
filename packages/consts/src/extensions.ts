// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface ExtensionListItem {
	title: string
	website: string
	category: string
	features: string[] | string
	additionalAssets?: Array<{
		input: string
		outputFilename: string
	}>
}

export type ExtensionsList = Record<string, ExtensionListItem>

export type ExtensionArrayListItem = ExtensionListItem & {
	id: string
}

export const extensions: ExtensionsList = {
	ledger: {
		title: 'Ledger',
		website: 'ledger.com',
		category: 'hardware',
		features: [],
		additionalAssets: [
			{
				input: 'icon-square.svg',
				outputFilename: 'LedgerSquare',
			},
		],
	},
	'polkadot-js': {
		title: 'Polkadot JS',
		website: 'polkadot.js.org/extension',
		category: 'web-extension',
		features: '*',
	},
	polkadotvault: {
		title: 'Polkadot Vault',
		website: 'https://vault.novasama.io/',
		category: 'hardware',
		features: [],
	},
	'subwallet-js': {
		title: 'SubWallet',
		website: 'subwallet.app',
		category: 'web-extension',
		features: '*',
	},
	talisman: {
		title: 'Talisman',
		website: 'talisman.xyz',
		category: 'web-extension',
		features: '*',
	},
}

export default extensions
