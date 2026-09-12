// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { pageFromUri } from '@w3ux/utils'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useNominationWarnings } from 'hooks/useNominationWarnings'
import { useSyncing } from 'hooks/useSyncing'
import { useTxMeta } from 'hooks/useTxMeta'
import { useLocation } from 'react-router-dom'
import { Spinner } from 'ui-core/base'

export const Sync = () => {
	const { uids } = useTxMeta()
	const { syncing } = useSyncing()
	const { pathname } = useLocation()
	const { bondedPools } = useBondedPools()
	const { isLoading: warningsLoading } = useNominationWarnings()

	// Keep syncing if on pools page and still fetching bonded pools or pool members
	const onPoolsSyncing = () => {
		if (pageFromUri(pathname, 'overview') === 'pools') {
			if (!bondedPools.length) {
				return true
			}
		}
		return false
	}

	const isSyncing =
		syncing ||
		warningsLoading ||
		onPoolsSyncing() ||
		uids.filter(({ submitted }) => submitted).length > 0

	return isSyncing ? (
		<span style={{ marginRight: '1rem' }}>
			<Spinner />
		</span>
	) : null
}
