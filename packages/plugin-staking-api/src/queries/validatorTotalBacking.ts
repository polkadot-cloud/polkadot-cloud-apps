// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import { type FetchQueryOptions, fetchQuery } from './generic'

const QUERY = gql`
  query ValidatorTotalBacking($network: String!, $validator: String!) {
    validatorTotalBacking(network: $network, validator: $validator)
  }
`

export const fetchValidatorTotalBacking = (
	network: string,
	validator: string,
	options?: FetchQueryOptions,
) =>
	fetchQuery<{ validatorTotalBacking: string | null }>(
		QUERY,
		{ network, validator },
		{ validatorTotalBacking: null },
		options,
	)
