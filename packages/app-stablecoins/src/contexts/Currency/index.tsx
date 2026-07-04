// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { FiatCurrencyKey } from 'consts'
import { SupportedCurrencies } from 'consts/currencies'
import type { ReactNode } from 'react'
import { useState } from 'react'

type CurrencyContextInterface = {
	currency: string
	setCurrency: (currency: string) => void
}

export const [CurrencyContext, useCurrency] =
	createSafeContext<CurrencyContextInterface>()

const getInitialCurrency = () => {
	const storedCurrency = localStorage.getItem(FiatCurrencyKey) || 'USD'

	return Object.keys(SupportedCurrencies).includes(storedCurrency)
		? storedCurrency
		: 'USD'
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
	const [currency, setCurrencyState] = useState<string>(getInitialCurrency())

	const setCurrency = (nextCurrency: string) => {
		setCurrencyState(nextCurrency)
		if (Object.keys(SupportedCurrencies).includes(nextCurrency)) {
			localStorage.setItem(FiatCurrencyKey, nextCurrency)
		}
	}

	return (
		<CurrencyContext.Provider
			value={{
				currency,
				setCurrency,
			}}
		>
			{children}
		</CurrencyContext.Provider>
	)
}
