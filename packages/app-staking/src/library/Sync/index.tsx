// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
import { useDataSync } from 'data-gate/react'
import { useSyncing } from 'hooks/useSyncing'
import { useTxMeta } from 'hooks/useTxMeta'
import { Spinner } from 'ui-core/base'
export const Sync = () => {
	const { syncing } = useSyncing()
	const dataSyncing = useDataSync()
	const { uids } = useTxMeta()
	return syncing || dataSyncing || uids.some(({ submitted }) => submitted) ? (
		<span style={{ marginRight: '1rem' }}>
			<Spinner />
		</span>
	) : null
}
