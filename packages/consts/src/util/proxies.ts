// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SupportedProxies } from '@polkadot-cloud/connect-proxies'

// Check if proxy type is supported in the dashboard
export const isSupportedProxy = (proxy: string) =>
	Object.keys(SupportedProxies).includes(proxy) || proxy === 'Any'

// Check if proxy call is supported for a given proxy type
export const isSupportedProxyCall = (
	proxy: string,
	pallet: string,
	method: string,
) => {
	if ([method, pallet].includes('undefined')) {
		return false
	}
	const call = `${pallet}.${method}`
	const calls = SupportedProxies[proxy]
	return (calls || []).find((c) => ['*', call].includes(c)) !== undefined
}
