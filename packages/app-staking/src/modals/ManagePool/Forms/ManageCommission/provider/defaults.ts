// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { PoolCommissionContextInterface } from './types'

export const defaultPoolCommissionContext: PoolCommissionContextInterface = {
	setCommission: (_commission) => {},
	setPayee: (_payee) => {},
	setMaxCommission: (_maxCommission) => {},
	setChangeRate: (_changeRate) => {},
	setFeatureEnabled: (_feature, _enabled) => {},
	initial: {
		commission: 0,
		payee: null,
		maxCommission: 100,
		changeRate: {
			maxIncrease: 10,
			minDelay: 0,
		},
	},
	current: {
		commission: 0,
		payee: null,
		maxCommission: 100,
		changeRate: {
			maxIncrease: 10,
			minDelay: 0,
		},
	},
	enabled: {
		maxCommission: false,
		changeRate: false,
	},
	hasValue: {
		maxCommission: false,
		changeRate: false,
	},
	updated: {
		commission: false,
		payee: false,
		maxCommission: false,
		changeRate: false,
	},
	resetAll: () => {},
}
