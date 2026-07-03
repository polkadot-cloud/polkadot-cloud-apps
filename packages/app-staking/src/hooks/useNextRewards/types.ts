// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TimeLeftFormatted } from '@w3ux/types'

export interface UseNextRewardsReturn {
	formatted: TimeLeftFormatted
	timeleftResult: {
		timeleft: number
		end: number
		percentSurpassed: number
		percentRemaining: number
	}
	activeEra: {
		index: number
		start: bigint
	}
}
