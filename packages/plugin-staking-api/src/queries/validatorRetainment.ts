// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'
import type { QueryReturn, ValidatorRetainmentData } from '../types'
import { useApiQuery } from './generic'
import { THREE_MONTH_VALIDATOR_RETAINMENT } from './retainmentFragments'

const QUERY = gql`
  ${THREE_MONTH_VALIDATOR_RETAINMENT}
  query ValidatorRetainment($network: String!, $validator: String!) {
    validatorRetainment(network: $network, validator: $validator) {
      months {
        fromTimestamp
        netInflow
        retainmentRate
        selfStakeChange
        compoundRate
        ...ThreeMonthValidatorRetainment
      }
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
