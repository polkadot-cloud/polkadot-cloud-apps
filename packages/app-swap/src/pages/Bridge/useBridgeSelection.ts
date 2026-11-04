// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CrossChainDestinations } from 'consts/crossChain'
import { useState } from 'react'
import type {
	CrossChainAsset,
	CrossChainTransferInput,
	StablecoinChainId,
} from 'types'
import { chainOptions, findOption } from '../../library/AssetTransfer/options'
import { getBridgeOptions } from './options'

type Selection = Pick<
	CrossChainTransferInput,
	'from' | 'to' | 'symbol' | 'feeAsset'
> & {
	amount: string
}

// Keep the route, supported tokens and entered amount in one form state.
export const useBridgeSelection = () => {
	const [selection, setSelection] = useState<Selection>({
		from: 'statemint',
		to: 'hydration',
		symbol: 'USDC',
		feeAsset: 'USDC',
		amount: '',
	})
	const { from, to } = selection
	const selectRoute = (
		source: StablecoinChainId,
		destination: StablecoinChainId,
	) => {
		const nextDestination = CrossChainDestinations[source].includes(destination)
			? destination
			: CrossChainDestinations[source][0]
		const { tokenOptions, feeTokenOptions } = getBridgeOptions(
			source,
			nextDestination,
		)
		setSelection((current) => ({
			from: source,
			to: nextDestination,
			symbol: findOption(tokenOptions, current.symbol).value,
			feeAsset: findOption(feeTokenOptions, current.feeAsset).value,
			amount: '',
		}))
	}

	return {
		...selection,
		...getBridgeOptions(from, to),
		destinationOptions: chainOptions.filter(({ value }) =>
			CrossChainDestinations[from].includes(value),
		),
		selectFrom: (source: StablecoinChainId) => selectRoute(source, to),
		selectTo: (destination: StablecoinChainId) =>
			selectRoute(from, destination),
		reverse: () => selectRoute(to, from),
		setAmount: (amount: string) =>
			setSelection((current) => ({ ...current, amount })),
		setSymbol: (symbol: CrossChainAsset) =>
			setSelection((current) => ({ ...current, symbol, amount: '' })),
		setFeeAsset: (feeAsset: CrossChainAsset) =>
			setSelection((current) => ({ ...current, feeAsset })),
	}
}
