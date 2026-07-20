// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { KusamaKnownPoolIds, PolkadotKnownPoolIds } from '../pools'

export const getNetworkKnownPoolIds = (network: string): number[] => {
	switch (network) {
		case 'polkadot':
			return PolkadotKnownPoolIds
		case 'kusama':
			return KusamaKnownPoolIds
		default:
			return []
	}
}

// Pool-era reward share metrics are restricted to Polkadot Cloud known pools
// on the Polkadot network.
export const isPoolShareEnabled = (
	network: string,
	poolId: number | undefined,
): boolean =>
	network === 'polkadot' &&
	poolId !== undefined &&
	PolkadotKnownPoolIds.includes(poolId)
