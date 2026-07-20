// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
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

	// `price` is 0 when unknown — price plugin disabled, ignored network, or not
	// yet loaded. Render an em-dash rather than a misleading "$0.00" fiat value.
	// A genuine zero balance with a known price still formats as "$0.00" below.
	if (price === 0) {
		return <>&mdash;</>
	}

	// Convert balance to fiat value
	const freeFiat = new BigNumber(rmCommas(String(tokenBalance)))
		.multipliedBy(price)
		.decimalPlaces(2)

	// Format using the user's preferred currency
	return <>{formatFiatCurrency(freeFiat.toNumber(), currency)}</>
}
