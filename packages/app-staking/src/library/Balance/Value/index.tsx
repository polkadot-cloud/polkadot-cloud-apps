// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { rmCommas } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { useTokenPrices } from 'hooks/useTokenPrices'
import { formatFiatCurrency } from 'locales/util'

export const Value = ({
	tokenBalance,
	currency,
}: {
	tokenBalance: string | number
	currency: string
}) => {
	const { price } = useTokenPrices()

	// Convert balance to fiat value
	const freeFiat = new BigNumber(rmCommas(String(tokenBalance)))
		.multipliedBy(price)
		.decimalPlaces(2)

	// Format using the user's preferred currency
	return <>{formatFiatCurrency(freeFiat.toNumber(), currency)}</>
}
