// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DocumentNode } from '@apollo/client'
import type { ResourceName } from '../policy'
import type { ResourceDefinition } from '../types'
import { queryStakingApi } from './stakingApi'

// Shared mechanics for resources available only through the API. Domain modules own their
// variables and result types; the policy owns network and module availability.
export const apiResource = <T>(
	name: ResourceName,
	operation: string,
	query: DocumentNode,
	variables: Record<string, unknown>,
	enabled = true,
): ResourceDefinition<T> => ({
	name,
	key: [operation, variables],
	enabled,
	load: ({ network, signal }) =>
		queryStakingApi<T>(query, { ...variables, network }, signal),
})
