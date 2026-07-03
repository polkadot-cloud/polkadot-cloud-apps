// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominatorProgress } from './types'

export const defaultNominatorProgress: NominatorProgress = {
	payee: {
		destination: null,
		account: null,
	},
	nominations: [],
	bond: '',
}
