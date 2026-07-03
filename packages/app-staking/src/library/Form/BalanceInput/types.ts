// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import type { ValueSetter } from '../types'

export interface BalanceInputProps {
	maxAvailable: BigNumber
	value: string
	defaultValue: string
	syncing?: boolean
	setters: ValueSetter[]
	disabled: boolean
	disableTxFeeUpdate?: boolean
}
