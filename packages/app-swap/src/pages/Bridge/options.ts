// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isCrossChainAsset } from 'consts/crossChain'
import type { CrossChainAsset, FeeAssetSymbol } from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'
import {
	assetOptions,
	feeAssetOptions,
} from '../../library/AssetTransfer/options'

const isBridgeOption = (
	option: DropdownOption<FeeAssetSymbol>,
): option is DropdownOption<CrossChainAsset> => isCrossChainAsset(option.value)

export const tokenOptions = assetOptions.filter(isBridgeOption)
export const feeTokenOptions = feeAssetOptions.filter(isBridgeOption)
