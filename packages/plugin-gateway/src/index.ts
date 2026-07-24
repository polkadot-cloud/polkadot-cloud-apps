// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const GATEWAY_BASE_URL = 'https://gateway.polkadot.cloud'

export interface AccountAddress {
	address: string
	name: string
}

export interface AccountsTokenResponse {
	token: string
	accessCode: string
}

export const fetchAccountsToken = async (
	addresses: AccountAddress[],
	options?: { signal?: AbortSignal },
): Promise<AccountsTokenResponse> => {
	const response = await fetch(`${GATEWAY_BASE_URL}/accounts-token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ addresses }),
		signal: options?.signal,
	})

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`)
	}

	return response.json()
}
