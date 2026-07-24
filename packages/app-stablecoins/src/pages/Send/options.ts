// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	FeeAssetSymbols,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	isStablecoinFeeAssetSupported,
	isStablecoinSendAssetSupported,
	StablecoinChains,
	StablecoinSymbols,
} from 'consts/stablecoins'
import type { FeeAssetSymbol, StablecoinChainId, StablecoinSymbol } from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'

export const stablecoinOptions: DropdownOption<StablecoinSymbol>[] =
	StablecoinSymbols.map((symbol) => ({
		value: symbol,
		label: symbol,
		icon: getFeeTokenIcon(symbol),
	}))

export const feeAssetOptions: DropdownOption<FeeAssetSymbol>[] =
	FeeAssetSymbols.map((symbol) => ({
		value: symbol,
		label: symbol,
		icon: getFeeTokenIcon(symbol),
	}))

export const chainOptions: DropdownOption<StablecoinChainId>[] =
	StablecoinChains.map((chain) => ({
		value: chain,
		label: getStablecoinChainLabel(chain),
	}))

export const getTokenOptions = (chain: StablecoinChainId) =>
	stablecoinOptions.filter((option) =>
		isStablecoinSendAssetSupported(chain, option.value),
	)

export const getFeeAssetOptions = (chain: StablecoinChainId) =>
	feeAssetOptions.filter((option) =>
		isStablecoinFeeAssetSupported(chain, option.value),
	)

export const findOption = <T extends string>(
	options: DropdownOption<T>[],
	value: T,
): DropdownOption<T> =>
	options.find((option) => option.value === value) ?? options[0]
