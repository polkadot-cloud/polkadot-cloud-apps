// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { ActiveAccount, ActiveProxy } from 'types'

type ProxySignerOption = {
	address: string
	source: string
	proxyType?: string | null
} | null

// Formats an ActiveAccount into the hook's `from` prop structure.
export const formatFromProp = (
	account: ActiveAccount,
	proxy: ActiveProxy | null,
) => ({
	address: account?.address || null,
	source: account?.source || null,
	proxy,
})

// Filters out non-proxy signers from a proxy switcher's current signer.
export const filterNonProxy = (
	currentProxy: ProxySignerOption,
): ActiveProxy | null => {
	if (!currentProxy?.proxyType) {
		return null
	}
	return {
		address: currentProxy.address,
		source: currentProxy.source,
		proxyType: currentProxy.proxyType,
	}
}

export const stringifyWithBigInt = (value: unknown) =>
	JSON.stringify(value, (_key, nextValue) =>
		typeof nextValue === 'bigint' ? nextValue.toString() : nextValue,
	)

// Reads the native currency properties used to build a Ledger metadata proof.
export const getSigningNetworkInfo = async (
	client: SubmittableExtrinsic['client'],
) => {
	const properties = await client.chainSpec.properties()
	const decimals = Array.isArray(properties.tokenDecimals)
		? properties.tokenDecimals[0]
		: properties.tokenDecimals
	const tokenSymbol = Array.isArray(properties.tokenSymbol)
		? properties.tokenSymbol[0]
		: properties.tokenSymbol
	if (
		typeof decimals !== 'number' ||
		!Number.isInteger(decimals) ||
		decimals < 0 ||
		decimals > 255 ||
		typeof tokenSymbol !== 'string' ||
		!tokenSymbol.trim()
	) {
		throw new Error(
			'Missing or invalid native currency properties for Ledger signing',
		)
	}
	return { decimals, tokenSymbol }
}
