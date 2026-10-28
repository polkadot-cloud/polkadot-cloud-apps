// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'

export const VALIDATOR_RETAINMENT_FIELDS = gql`
  fragment ValidatorRetainmentWindowFields on ValidatorRetainmentWindow {
    month
    year
    windowMonths
    includedMonthCount
    fromEra
    toEra
    fromTimestamp
    toTimestamp
    graphRewards
    netInflow
    retained
    retainmentRate
    validatorRewards
    selfStakeChange
    compounded
    compoundRate
  }

  fragment ValidatorRetainmentFields on ValidatorRetainment {
    oneMonth { ...ValidatorRetainmentWindowFields }
    threeMonths { ...ValidatorRetainmentWindowFields }
  }
`

export const OPERATOR_RETAINMENT_FIELDS = gql`
  fragment OperatorRetainmentWindowFields on OperatorRetainmentWindow {
    month
    year
    windowMonths
    includedMonthCount
    fromEra
    toEra
    fromTimestamp
    toTimestamp
    graphRewards
    netInflow
    retained
    retainmentRate
  }

  fragment OperatorRetainmentFields on OperatorRetainment {
    oneMonth { ...OperatorRetainmentWindowFields }
    threeMonths { ...OperatorRetainmentWindowFields }
  }
`
