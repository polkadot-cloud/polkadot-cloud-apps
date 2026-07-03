// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SignerOption } from 'hooks/useProxySwitcher/types'
import type { ActiveAccount, ActiveProxy } from 'types'

// Formats an ActiveAccount into the hook's `from` prop structure
export const formatFromProp = (
	account: ActiveAccount,
	proxy: ActiveProxy | null,
) => {
	return {
		address: account?.address || null,
		source: account?.source || null,
		proxy,
	}
}

// Filters out non-proxy signers from a proxy switcher's current signer
export const filterNonProxy = (
	currentProxy: SignerOption | null,
): ActiveProxy | null => {
	if (!currentProxy) {
		return null
	}
	// If proxyType is null or undefined, this signer is not a proxy
	if (currentProxy.proxyType === null || currentProxy.proxyType === undefined) {
		return null
	}
	return currentProxy as ActiveProxy
}
