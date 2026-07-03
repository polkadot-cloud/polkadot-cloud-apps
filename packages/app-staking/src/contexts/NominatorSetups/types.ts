// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeString } from '@w3ux/types'
import type { MaybeAddress, Validator } from 'types'

export interface NominatorSetupsContextInterface {
	getNominatorSetup: (address: MaybeAddress) => NominatorSetup
	setNominatorSetup: (progress: NominatorProgress, section?: number) => void
	removeNominatorSetup: (address: MaybeAddress) => void
	getNominatorSetupPercent: (address: MaybeAddress) => number
	setNominatorSetupSection: (section: number) => void
	generateOptimalSetup: () => NominatorProgress
}

export type PayeeOption = 'Staked' | 'Stash' | 'Controller' | 'Account' | 'None'

export type NominatorSetups = Record<string, NominatorSetup>

export interface NominatorSetup {
	section: number
	progress: NominatorProgress
}

export interface NominatorProgress {
	payee: PayeeConfig
	nominations: Validator[]
	bond: MaybeString
}

export interface PayeeConfig {
	destination: PayeeOption | null
	account: MaybeAddress
}
