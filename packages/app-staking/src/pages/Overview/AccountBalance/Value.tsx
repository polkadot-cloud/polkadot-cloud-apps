// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useTokenPrices } from 'hooks/useTokenPrices'
import { formatFiatCurrency } from 'locales/util'

export const Value = ({ totalBalance }: { totalBalance: BigNumber }) => {
	const { price } = useTokenPrices()

	// Convert balance to fiat value
	const freeFiat = totalBalance.multipliedBy(
		new BigNumber(price).decimalPlaces(2),
	)

	// Use the enhanced currency formatting function
	return <>{formatFiatCurrency(freeFiat.toNumber())}</>
}
