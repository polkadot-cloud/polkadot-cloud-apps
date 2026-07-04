// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'

export type BalanceInputSetter = ({ value }: { value: BigNumber }) => void

export interface BalanceInputProps {
	maxAvailable: BigNumber
	value: string
	defaultValue: string
	syncing?: boolean
	setters: BalanceInputSetter[]
	disabled: boolean
	disableTxFeeUpdate?: boolean
}
