// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { SanitizeNomineeCandidatesData } from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query SanitizeNomineeCandidates($network: String!, $addresses: [String!]!) {
    sanitizeNomineeCandidates(network: $network, addresses: $addresses)
  }
`

const DEFAULT: SanitizeNomineeCandidatesData = {
	sanitizeNomineeCandidates: [],
}

export const fetchSanitizeNomineeCandidates = (
	network: string,
	addresses: string[],
) =>
	fetchQuery<SanitizeNomineeCandidatesData>(
		QUERY,
		{ network, addresses },
		DEFAULT,
	)
