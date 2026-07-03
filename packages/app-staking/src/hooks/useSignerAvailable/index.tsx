// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useBalances } from 'hooks/useBalances'
import type { ActiveAccount } from 'types'

export const useSignerAvailable = () => {
	const { activeProxy } = useActiveProxy()
	const { getStakingLedger } = useBalances()
	const { accountHasSigner } = useImportedAccounts()

	const signerAvailable = (who: ActiveAccount, proxySupported: boolean) => {
		const { controllerUnmigrated } = getStakingLedger(who?.address || null)

		if (controllerUnmigrated) {
			return 'controller_not_migrated'
		}
		if (
			(!proxySupported || !accountHasSigner(activeProxy)) &&
			!accountHasSigner(who)
		) {
			return 'read_only'
		}
		return 'ok'
	}

	return {
		signerAvailable,
	}
}
