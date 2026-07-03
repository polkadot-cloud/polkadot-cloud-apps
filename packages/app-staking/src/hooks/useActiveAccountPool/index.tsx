// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { determinePoolDisplay } from 'contexts/Pools/util'
import { getPoolMembership } from 'global-bus'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useTranslation } from 'react-i18next'

export const useActiveAccountPool = () => {
	const { t } = useTranslation('pages')
	const {
		isReady,
		poolsConfig: { maxPools },
	} = useApi()
	const { bondedPools } = useBondedPools()
	const { poolsMetaData } = useBondedPools()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { balances } = useAccountBalances(activeAddress)
	const { membership } = getPoolMembership(activeAddress)
	const { activePool, isOwner, isDepositor, isBouncer, isMember } =
		useActivePool()

	const { active } = balances.pool
	const poolState = activePool?.bondedPool?.state ?? null

	const inPool = !!activePool
	const isActive = inPool && isMember() && active > 0n

	// Display manage button if active account is not a read-only account and active account is
	// pool owner or bouncer, or if active account is a pool member
	const canManage =
		!isReadOnlyAccount(activeAddress) &&
		(isActive || (poolState !== 'Destroying' && (isOwner() || isBouncer())))

	let membershipDisplay = t('notInPool')

	if (activePool) {
		// Determine pool membership display.
		membershipDisplay = determinePoolDisplay(
			activePool.addresses.stash,
			poolsMetaData[Number(activePool.id)],
		)
	}

	const getCreateDisabled = () => {
		if (!isReady || isReadOnlyAccount(activeAddress) || !activeAddress) {
			return true
		}
		if ((maxPools && maxPools === 0) || bondedPools.length === maxPools) {
			return true
		}
		return false
	}

	let label
	const getJoinDisabled = () =>
		!isReady ||
		isReadOnlyAccount(activeAddress) ||
		!activeAddress ||
		!bondedPools.length

	if (!membership) {
		label = t('membership')
	} else if (isDepositor()) {
		label = `${t('depositorOfPool')} ${membership.poolId}`
	} else if (isOwner()) {
		label = `${t('ownerOfPool')} ${membership.poolId}`
	} else if (active > 0n) {
		label = `${t('memberOfPool')} ${membership.poolId}`
	} else {
		label = `${t('leavingPool')} ${membership.poolId}`
	}

	return {
		inPool,
		isActive,
		canManage,
		activePool,
		membershipDisplay,
		label,
		getJoinDisabled,
		getCreateDisabled,
	}
}
