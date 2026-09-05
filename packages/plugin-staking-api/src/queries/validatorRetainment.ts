// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorRetainmentData } from '../types'
import { VALIDATOR_RETAINMENT_FIELDS } from './fragments/retainment'
import { useApiQuery } from './generic'

const QUERY = gql`
  ${VALIDATOR_RETAINMENT_FIELDS}
  query ValidatorRetainment($network: String!, $validator: String!) {
    validatorRetainment(network: $network, validator: $validator) {
      months { ...ValidatorRetainmentWindowFields }
      retainment { ...ValidatorRetainmentFields }
    }
  }
`

const DEFAULT: ValidatorRetainmentData = {
	validatorRetainment: null,
}

export const useValidatorRetainment = (
	variables: { network: string; validator: string },
	options?: { skip?: boolean },
): QueryReturn<ValidatorRetainmentData> =>
	useApiQuery<ValidatorRetainmentData>(QUERY, variables, DEFAULT, options)
