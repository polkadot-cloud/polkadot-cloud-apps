// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type {
	SanitizeNomineeCandidate,
	SanitizeNomineeCandidatesData,
} from '../types'
import { fetchQuery } from './generic'

const QUERY = gql`
  query SanitizeNomineeCandidates(
    $network: String!
    $addresses: [ValidatorInput!]!
  ) {
    sanitizeNomineeCandidates(network: $network, addresses: $addresses) {
      address
      prefs {
        commission
        blocked
      }
    }
  }
`

const DEFAULT: SanitizeNomineeCandidatesData = {
	sanitizeNomineeCandidates: [],
}

export const fetchSanitizeNomineeCandidates = (
	network: string,
	validators: SanitizeNomineeCandidate[],
) =>
	fetchQuery<SanitizeNomineeCandidatesData>(
		QUERY,
		{ network, addresses: validators },
		DEFAULT,
	)
