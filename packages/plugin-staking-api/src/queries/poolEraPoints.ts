// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { PoolEraPointsData, QueryReturn } from '../types'
import { useApiQuery } from './generic'

const QUERY = gql`
  query PoolEraPoints(
    $network: String!
    $poolId: Int!
    $fromEra: Int!
    $depth: Int
  ) {
    poolEraPoints(
      network: $network
      poolId: $poolId
      fromEra: $fromEra
      depth: $depth
    ) {
      era
      points
      start
    }
  }
`

const DEFAULT: PoolEraPointsData = {
	poolEraPoints: [],
}

export const usePoolEraPoints = (variables: {
	network: string
	poolId: number
	fromEra: number
	depth?: number
}): QueryReturn<PoolEraPointsData> =>
	useApiQuery<PoolEraPointsData>(QUERY, variables, DEFAULT)
