// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DocumentNode } from '@apollo/client'
import { client } from 'plugin-staking-api'

// The transport preserves errors. Only the resource owner may decide whether a fallback is valid.
export const queryStakingApi = async <T>(
	query: DocumentNode,
	variables: Record<string, unknown>,
	signal: AbortSignal,
): Promise<T> => {
	const result = await client.query<T>({
		query,
		variables,
		fetchPolicy: 'no-cache',
		errorPolicy: 'none',
		context: { fetchOptions: { signal }, queryDeduplication: false },
	})
	if (result.data === undefined || result.data === null)
		throw new Error('Staking API returned no data')
	return result.data
}
