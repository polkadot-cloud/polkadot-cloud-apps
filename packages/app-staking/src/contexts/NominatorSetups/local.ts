// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault } from '@w3ux/utils'
import { NominatorSetupsKey } from 'consts'
import type { NominatorSetups } from './types'

// Get local nominator setups
export const getLocalNominatorSetups = () =>
	localStorageOrDefault(NominatorSetupsKey, {}, true) as NominatorSetups

// Either update local pool setups or remove if empty
export const setLocalNominatorSetups = (setups: NominatorSetups) => {
	const setupsStr = JSON.stringify(setups)
	if (setupsStr === '{}') {
		localStorage.removeItem(NominatorSetupsKey)
	} else {
		localStorage.setItem(NominatorSetupsKey, setupsStr)
	}
}
