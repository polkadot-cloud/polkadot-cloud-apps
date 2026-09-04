// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { gql } from '@apollo/client'

export const THREE_MONTH_VALIDATOR_RETAINMENT = gql`
  fragment ThreeMonthValidatorRetainment on ValidatorRetainmentPeriod {
    threeMonthNetInflow
    threeMonthRetainmentRate
    threeMonthPeriodCount
    threeMonthSelfStakeChange
    threeMonthCompoundRate
  }
`

export const VALIDATOR_RETAINMENT_PERIOD = gql`
  ${THREE_MONTH_VALIDATOR_RETAINMENT}
  fragment ValidatorRetainmentPeriodFields on ValidatorRetainmentPeriod {
    fromTimestamp
    netInflow
    retainmentRate
    selfStakeChange
    compoundRate
    ...ThreeMonthValidatorRetainment
  }
`

export const THREE_MONTH_OPERATOR_RETAINMENT = gql`
  fragment ThreeMonthOperatorRetainment on OperatorRetainmentPeriod {
    threeMonthNetInflow
    threeMonthRetainmentRate
    threeMonthPeriodCount
  }
`
