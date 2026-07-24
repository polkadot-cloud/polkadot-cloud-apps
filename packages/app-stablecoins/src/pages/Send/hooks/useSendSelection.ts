// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	isStablecoinFeeAssetSupported,
	isStablecoinSendAssetSupported,
} from 'consts/stablecoins'
import { useMemo, useReducer } from 'react'
import {
	chainOptions,
	feeAssetOptions,
	findOption,
	getFeeAssetOptions,
	getTokenOptions,
	stablecoinOptions,
} from '../options'
import type {
	SendSelection,
	SendSelectionAction,
	SendSelectionState,
} from './types'

const initialChain = chainOptions[0].value
const initialState: SendSelectionState = {
	amount: '',
	chain: initialChain,
	feeAsset: getFeeAssetOptions(initialChain)[0].value,
	token: getTokenOptions(initialChain)[0].value,
}

const reducer = (
	state: SendSelectionState,
	action: SendSelectionAction,
): SendSelectionState => {
	switch (action.type) {
		case 'setAmount':
			return { ...state, amount: action.amount }
		case 'selectChain': {
			const token = isStablecoinSendAssetSupported(action.chain, state.token)
				? state.token
				: getTokenOptions(action.chain)[0]?.value || state.token
			const feeAsset = isStablecoinFeeAssetSupported(
				action.chain,
				state.feeAsset,
			)
				? state.feeAsset
				: getFeeAssetOptions(action.chain)[0]?.value || state.feeAsset

			return { ...state, chain: action.chain, feeAsset, token }
		}
		case 'selectFeeAsset':
			return { ...state, feeAsset: action.feeAsset }
		case 'selectToken':
			return { ...state, token: action.token }
	}
}

export const useSendSelection = (): SendSelection => {
	const [state, dispatch] = useReducer(reducer, initialState)
	const tokenOptions = useMemo(
		() => getTokenOptions(state.chain),
		[state.chain],
	)
	const availableFeeAssetOptions = useMemo(
		() => getFeeAssetOptions(state.chain),
		[state.chain],
	)

	return {
		...state,
		availableFeeAssetOptions,
		chainOptions,
		selectedChain: findOption(chainOptions, state.chain),
		selectedFeeAsset: findOption(feeAssetOptions, state.feeAsset),
		selectedToken: findOption(stablecoinOptions, state.token),
		setAmount: (amount: string) => dispatch({ type: 'setAmount', amount }),
		setSelectedChain: (option) =>
			dispatch({ type: 'selectChain', chain: option.value }),
		setSelectedFeeAsset: (option) =>
			dispatch({ type: 'selectFeeAsset', feeAsset: option.value }),
		setSelectedToken: (option) =>
			dispatch({ type: 'selectToken', token: option.value }),
		tokenOptions,
	}
}
