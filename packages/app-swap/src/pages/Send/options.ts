// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	FeeAssetSymbols,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	isAssetSendSupported,
	isStablecoinFeeAssetSupported,
	SendAssetSymbols,
	StablecoinChains,
} from 'consts/stablecoins'
import type { FeeAssetSymbol, SendAssetSymbol, StablecoinChainId } from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'

export const assetOptions: DropdownOption<SendAssetSymbol>[] =
	SendAssetSymbols.map((symbol) => ({
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
	assetOptions.filter((option) => isAssetSendSupported(chain, option.value))

export const getFeeAssetOptions = (chain: StablecoinChainId) =>
	feeAssetOptions.filter((option) =>
		isStablecoinFeeAssetSupported(chain, option.value),
	)

export const findOption = <T extends string>(
	options: DropdownOption<T>[],
	value: T,
): DropdownOption<T> =>
	options.find((option) => option.value === value) ?? options[0]
