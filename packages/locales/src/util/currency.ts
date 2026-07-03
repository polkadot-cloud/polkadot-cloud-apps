// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FiatCurrencyKey } from 'consts'
import { SupportedCountries } from 'consts/countries'
import { SupportedCurrencies } from 'consts/currencies'

const FallbackFiatCurrency = 'USD'

const isSupportedCurrency = (currency: string) =>
	Object.keys(SupportedCurrencies).includes(currency)

/**
 * Get the user's default fiat currency from their browser locale.
 */
export const getDefaultFiatCurrency = (): string => {
	if (typeof navigator === 'undefined') {
		return FallbackFiatCurrency
	}

	const locale = navigator.language

	// Get country from locale (e.g., en-US -> US)
	const parts = locale.split('-')
	if (parts.length > 1) {
		const countryCode = parts[1].toUpperCase()
		const fiat = SupportedCountries[countryCode]?.defaultCurrency
		if (fiat && isSupportedCurrency(fiat)) {
			return fiat
		}
	}

	// Fallback 1: Find the first country that includes `locale` as a language
	const countryFromLang = Object.entries(SupportedCountries).find(([, meta]) =>
		meta.languages.includes(locale),
	)?.[0]
	if (countryFromLang) {
		const fiat = SupportedCountries[countryFromLang]?.defaultCurrency
		if (fiat && isSupportedCurrency(fiat)) {
			return fiat
		}
	}

	// Fallback 2: Default to USD
	return FallbackFiatCurrency
}

/**
 * Get the user's preferred fiat currency from local storage or browser locale.
 */
export const getUserFiatCurrency = (): string => {
	try {
		// Try to get from local storage first
		const storedCurrency = localStorage.getItem(FiatCurrencyKey)
		if (storedCurrency && isSupportedCurrency(storedCurrency)) {
			return storedCurrency
		}
	} catch {
		// Fall back to the browser-locale default if storage access is blocked.
	}

	return getDefaultFiatCurrency()
}

/**
 * Format a number as currency based on the user's preferred currency and locale
 */
export const formatFiatCurrency = (
	value: number,
	currency?: string,
): string => {
	const currencyCode = currency || getUserFiatCurrency()
	const locale =
		typeof navigator === 'undefined' ? 'en-US' : navigator.language || 'en-US'

	const decimals: number = SupportedCurrencies[currencyCode]?.noDecimals ? 0 : 2

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value)
}
