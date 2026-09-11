// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Data gate owns caching and cancellation for these era snapshots.
export const requestOptions = (signal: AbortSignal) => ({
	throwOnError: true,
	fetchPolicy: 'no-cache' as const,
	context: { queryDeduplication: false, fetchOptions: { signal } },
})
