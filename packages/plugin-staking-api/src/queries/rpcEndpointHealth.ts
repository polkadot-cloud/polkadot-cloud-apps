// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { RpcEndpointHealthData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query RpcEndpointHealth($network: String!) {
    rpcEndpointHealth(network: $network) {
      chains {
        endpoints {
          label
          url
        }
        chain
      }
    }
  }
`

const DEFAULT: RpcEndpointHealthData = {
	rpcEndpointHealth: {
		chains: [],
	},
}

// NOTE: Test API key for the `rpcEndpointHealth` query. Key deliberately not stored in environment
// variables since this query is only used in testing and is not critical to the functioning of the
// app. Rotate key if moved to a private environment variable store.
const RPC_ENDPOINT_HEALTH_API_KEY = 'sk_test_api_key'

export const fetchRpcEndpointHealth = (network: string) =>
	fetchQuery<RpcEndpointHealthData>(QUERY, { network }, DEFAULT, {
		context: {
			headers: {
				'x-api-key': RPC_ENDPOINT_HEALTH_API_KEY,
			},
		},
	})
