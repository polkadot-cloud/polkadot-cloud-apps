// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DefaultContext, DocumentNode, FetchPolicy } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { client } from '../Client'
import type { QueryReturn } from '../types'

type Variables = Record<string, unknown>

export interface FetchQueryOptions {
	context?: DefaultContext
	fetchPolicy?: FetchPolicy
	throwOnError?: boolean
}

/**
 * Generic GraphQL query fetcher. Swallows errors and returns `defaultData` when the request fails
 * or returns no data, unless the caller needs errors to propagate.
 */
export const fetchQuery = async <T>(
	query: DocumentNode,
	variables: Variables,
	defaultData: T,
	options?: FetchQueryOptions,
): Promise<T> => {
	try {
		const result = await client.query<T>({
			query,
			variables,
			context: options?.context,
			fetchPolicy: options?.fetchPolicy,
		})
		if (!result?.data && options?.throwOnError) {
			throw new Error('Staking API returned no data')
		}
		return result?.data || defaultData
	} catch (error) {
		if (options?.throwOnError) {
			throw error
		}
		return defaultData
	}
}

/**
 * Generic React hook wrapper around Apollo's `useQuery`. Returns `defaultData` while loading or
 * when data is unavailable.
 */
export const useApiQuery = <T>(
	query: DocumentNode,
	variables: Variables,
	defaultData: T,
	options?: { skip?: boolean },
): QueryReturn<T> => {
	const { loading, error, data, refetch } = useQuery<T>(query, {
		variables,
		...options,
	})
	return { loading, error, data: data || defaultData, refetch }
}
