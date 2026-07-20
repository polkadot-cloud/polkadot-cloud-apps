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
    $candidates: [ValidatorInput!]!
  ) {
    sanitizeNomineeCandidates(network: $network, candidates: $candidates) {
      address
      prefs {
        commission
        blocked
      }
    }
  }
`

export const fetchSanitizeNomineeCandidates = (
	network: string,
	candidates: SanitizeNomineeCandidate[],
) =>
	fetchQuery<SanitizeNomineeCandidatesData>(
		QUERY,
		{ network, candidates },
		{ sanitizeNomineeCandidates: candidates },
	)
