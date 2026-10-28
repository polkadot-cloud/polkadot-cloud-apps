// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryStatus } from '@tanstack/react-query'
import type { MaybeAddress, NominationStatus } from 'types'

export interface EraStakersContextInterface {
	subscribeExposures: () => () => void
	exposuresStatus: QueryStatus
	getNominationsStatusFromEraStakers: (
		who: MaybeAddress,
		targets: string[],
	) => Record<string, NominationStatus>
}
