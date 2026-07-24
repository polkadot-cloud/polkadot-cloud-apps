// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchPoolWarnings } from 'plugin-staking-api'
import type { PoolWarningType } from 'plugin-staking-api/types'
import type { NetworkId } from 'types'
import { pluginEnabled } from '../plugins'
import { defaultPoolWarnings } from './default'
import { _poolWarnings } from './private'

export interface PoolWarning {
	poolId: number
	address: string
	type: PoolWarningType
}

export interface PoolWarningsState {
	[address: string]: PoolWarning[]
}

export const poolWarnings$ = _poolWarnings.asObservable()

export const getPoolWarnings = (): PoolWarningsState => _poolWarnings.getValue()

export const getPoolWarningsForAddress = (address: string): PoolWarning[] =>
	_poolWarnings.getValue()[address] || []

export const setPoolWarnings = (
	address: string,
	warnings: PoolWarning[],
): void => {
	_poolWarnings.next({
		..._poolWarnings.value,
		[address]: warnings,
	})
}

export const setPoolWarningsBatch = (
	warningsMap: Record<string, PoolWarning[]>,
): void => {
	_poolWarnings.next({
		..._poolWarnings.value,
		...warningsMap,
	})
}

export const fetchAndSetPoolWarnings = async (
	network: NetworkId,
	addresses: string[],
): Promise<void> => {
	// NOTE: pool warnings only available on polkadot
	if (
		network !== 'polkadot' ||
		addresses.length === 0 ||
		!pluginEnabled('staking_api')
	) {
		return
	}

	const result = await fetchPoolWarnings(network, addresses)
	const warningsMap: Record<string, PoolWarning[]> = {}

	addresses.forEach((address) => {
		const addressWarnings: PoolWarning[] = []

		result.warnings
			.filter((w) => w.address === address)
			.forEach((warning) => {
				warning.warningTypes.forEach((type) => {
					addressWarnings.push({
						poolId: warning.poolId,
						address: warning.address,
						type,
					})
				})
			})

		warningsMap[address] = addressWarnings
	})
	setPoolWarningsBatch(warningsMap)
}

export const resetPoolWarnings = (): void => {
	_poolWarnings.next(defaultPoolWarnings)
}
