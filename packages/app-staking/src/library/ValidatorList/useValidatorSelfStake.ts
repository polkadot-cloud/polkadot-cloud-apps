// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import BigNumber from 'bignumber.js'
import { useEraStakers } from 'contexts/EraStakers'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useHardCapSelfStake } from 'hooks/useStakingMetrics'
import { useEffect, useState } from 'react'
import { isMaxSelfStake, planckToUnitBn } from 'utils'

type QueriedStake = { key?: string; value?: bigint }

export const useValidatorSelfStake = (address: string, units: number) => {
	const { network } = useNetwork()
	const { isReady, serviceApi } = useApi()
	const { accounts } = useImportedAccounts()
	const { getStakingLedger } = useBalances()
	const { getActiveValidator } = useEraStakers()
	const hardCapSelfStake = useHardCapSelfStake()

	// Imported accounts already receive live ledger updates through managed subscriptions.
	const key = `${network}:${address}`
	const managed = accounts.some((account) => account.address === address)

	// Key one-shot results by network and address to prevent stale values during switches.
	const [queried, setQueried] = useState<QueriedStake>({})

	// Fetch the current ledger once for validators without a managed subscription.
	useEffect(() => {
		if (!isReady || managed) return

		let cancelled = false
		serviceApi.query
			.stakingLedgerActive(address)
			.then((value) => !cancelled && setQueried({ key, value }))
			.catch(() => !cancelled && setQueried({ key }))

		return () => {
			cancelled = true
		}
	}, [address, isReady, key, managed, serviceApi])

	// Prefer the subscribed ledger, then the one-shot query, then active-era exposure.
	const planck =
		getStakingLedger(address).ledger?.active ??
		(queried.key === key ? queried.value : undefined) ??
		getActiveValidator(address)?.own
	const stake = planck === undefined ? undefined : new BigNumber(planck)

	// Convert to token units and flag stakes at the configured hard cap.
	return {
		selfStake: stake === undefined ? undefined : planckToUnitBn(stake, units),
		selfStakeMax: isMaxSelfStake(stake, hardCapSelfStake),
	}
}
