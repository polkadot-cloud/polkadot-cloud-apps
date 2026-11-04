// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isCrossChainAssetSupported } from 'consts/crossChain'
import type { CrossChainAsset, FeeAssetSymbol, StablecoinChainId } from 'types'
import type { DropdownOption } from 'ui-app/Dropdown'
import {
	assetOptions,
	feeAssetOptions,
} from '../../library/AssetTransfer/options'

export const getBridgeOptions = (
	from: StablecoinChainId,
	to: StablecoinChainId,
) => {
	const supported = (
		option: DropdownOption<FeeAssetSymbol>,
	): option is DropdownOption<CrossChainAsset> =>
		isCrossChainAssetSupported(from, to, option.value)

	return {
		tokenOptions: assetOptions.filter(supported),
		feeTokenOptions: feeAssetOptions.filter(supported),
	}
}
