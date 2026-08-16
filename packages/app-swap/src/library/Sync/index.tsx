// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSyncing } from 'hooks/useSyncing'
import { Spinner } from 'ui-core/base'

export const Sync = () => {
	const { syncing } = useSyncing(['initialization'])

	return syncing ? (
		<span style={{ marginRight: '1rem' }}>
			<Spinner />
		</span>
	) : null
}
