// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleDown, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'

export const RewardsStatus = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { isReady } = useApi()
	const { activePool, inPool } = useActivePool()
	const { openModal } = useOverlay().modal
	const { activeAddress } = useActiveAccount()
	const { getPendingPoolRewards } = useBalances()
	const { syncing } = useSyncing(['active-pools'])
	const { isReadOnlyAccount } = useImportedAccounts()

	const { units } = getStakingChainData(network)
	const pendingRewards = getPendingPoolRewards(activeAddress)
	const minUnclaimedDisplay = 1000000n

	const labelRewards =
		pendingRewards > minUnclaimedDisplay
			? planckToUnit(pendingRewards, units).toString()
			: '0'

	// Display Reward buttons if unclaimed rewards is a non-zero value.
	const buttonsRewards = isReadOnlyAccount(activeAddress)
		? []
		: pendingRewards > minUnclaimedDisplay
			? [
					{
						title: t('withdraw'),
						icon: faCircleDown,
						disabled: !isReady,
						small: true,
						onClick: () =>
							openModal({
								key: 'ClaimReward',
								options: { claimType: 'withdraw' },
								size: 'sm',
							}),
					},
					{
						title: t('compound'),
						icon: faPlus,
						disabled:
							!isReady || activePool?.bondedPool?.state === 'Destroying',
						small: true,
						onClick: () =>
							openModal({
								key: 'ClaimReward',
								options: { claimType: 'bond' },
								size: 'sm',
							}),
					},
				]
			: undefined

	return (
		<Stat
			label={t('unclaimedRewards')}
			helpKey="Pool Rewards"
			type="odometer"
			stat={{ value: labelRewards }}
			dimmed={!inPool || pendingRewards <= minUnclaimedDisplay}
			buttons={syncing ? [] : buttonsRewards}
		/>
	)
}
