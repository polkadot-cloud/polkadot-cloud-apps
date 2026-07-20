// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBalances } from '../useBalances'
import type { StakingHookInterface } from './types'

export type {
	ActiveAccountOwnStake,
	ActiveAccountStaker,
	StakingHookInterface,
} from './types'

export const useStaking = (): StakingHookInterface => {
	const { activeAddress } = useActiveAccount()
	const { getStakingLedger, getNominations } = useBalances()
	const nominations = getNominations(activeAddress)

	const isBonding = (getStakingLedger(activeAddress).ledger?.active || 0n) > 0n
	const isNominating = nominations.length > 0
	const isNominator = activeAddress !== null && isBonding && isNominating

	return {
		isBonding,
		isNominating,
		isNominator,
	}
}
