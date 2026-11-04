// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	isCrossChainAsset,
	isCrossChainAssetSupported,
} from 'consts/crossChain'
import type { CrossChainAsset, FeeAssetSymbol, StablecoinChainId } from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'
import {
	assetOptions,
	feeAssetOptions,
} from '../../library/AssetTransfer/options'

const isBridgeOption = (
	option: DropdownOption<FeeAssetSymbol>,
): option is DropdownOption<CrossChainAsset> => isCrossChainAsset(option.value)

export const getBridgeTokenOptions = (
	from: StablecoinChainId,
	to: StablecoinChainId,
) =>
	assetOptions
		.filter(isBridgeOption)
		.filter(({ value }) => isCrossChainAssetSupported(from, to, value))

export const getBridgeFeeTokenOptions = (
	from: StablecoinChainId,
	to: StablecoinChainId,
) =>
	feeAssetOptions
		.filter(isBridgeOption)
		.filter(({ value }) => isCrossChainAssetSupported(from, to, value))
