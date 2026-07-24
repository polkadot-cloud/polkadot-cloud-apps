// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
