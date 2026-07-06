// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApolloProvider } from '@apollo/client/react'

export * from './Client'
export * from './queries/activeValidatorRanks'
export * from './queries/combinedPoolRewards'
export * from './queries/eraTotalNominators'
export * from './queries/generic'
export * from './queries/getStakerWithNominees'
export * from './queries/identityCache'
export * from './queries/nominatorRewardTrend'
export * from './queries/payeeNominatorRewards'
export * from './queries/poolCandidates'
export * from './queries/poolEraPoints'
export * from './queries/poolEraRewards'
export * from './queries/poolMembers'
export * from './queries/poolRewards'
export * from './queries/poolRewardTrend'
export * from './queries/poolWarnings'
export * from './queries/rewards'
export * from './queries/rpcEndpointHealth'
export * from './queries/searchValidators'
export * from './queries/tokenPrice'
export * from './queries/unclaimedRewards'
export * from './queries/validatorAvgRewardRateBatch'
export * from './queries/validatorEraPoints'
export * from './queries/validatorEraPointsBatch'
export * from './queries/validatorRewards'
export * from './queries/validatorStats'
export * from './util'

export { ApolloProvider }
