// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FiatCurrencyKey } from 'consts'
import { SupportedCurrencies } from 'consts/currencies'

const isSupportedCurrency = (currency: string) =>
	Object.keys(SupportedCurrencies).includes(currency)

export const persistCurrency = (currency: string) => {
	if (isSupportedCurrency(currency)) {
		localStorage.setItem(FiatCurrencyKey, currency)
	}
}
