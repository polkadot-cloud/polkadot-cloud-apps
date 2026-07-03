// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const SupportedCurrencies: Record<
	string,
	{
		symbol: string
		noDecimals?: boolean
	}
> = {
	USD: {
		symbol: '$',
	},
	EUR: {
		symbol: '€',
	},
	GBP: {
		symbol: '£',
	},
	AUD: {
		symbol: 'A$',
	},
	CAD: {
		symbol: 'C$',
	},
	CHF: {
		symbol: 'Fr',
	},
	CNY: {
		symbol: '¥',
	},
	JPY: {
		symbol: '¥',
		noDecimals: true,
	},
	INR: {
		symbol: '₹',
	},
	TRY: {
		symbol: '₺',
	},
	BRL: {
		symbol: 'R$',
	},
	COP: {
		symbol: 'COP$',
		noDecimals: true,
	},
	UAH: {
		symbol: '₴',
	},
	ZAR: {
		symbol: 'R',
	},
	PLN: {
		symbol: 'zł',
	},
	ARS: {
		symbol: 'ARS$',
	},
	MXN: {
		symbol: 'MX$',
	},
	CZK: {
		symbol: 'Kč',
	},
	RON: {
		symbol: 'lei',
	},
	BGN: {
		symbol: 'лв',
	},
	SGD: {
		symbol: 'S$',
	},
	NZD: {
		symbol: 'NZ$',
	},
	THB: {
		symbol: '฿',
	},
	KRW: {
		symbol: '₩',
		noDecimals: true,
	},
	IDR: {
		symbol: 'Rp',
		noDecimals: true,
	},
	MYR: { symbol: 'RM' },
	PHP: { symbol: '₱' },
}
