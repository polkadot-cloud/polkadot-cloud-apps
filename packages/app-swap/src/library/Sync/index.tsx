// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCrossChainDeliveryPending } from 'hooks/useCrossChainDelivery'
import { useSyncing } from 'hooks/useSyncing'
import { useTxMeta } from 'hooks/useTxMeta'
import { Spinner } from 'ui-core/base'

export const Sync = () => {
	const { syncing } = useSyncing(['initialization'])
	const { uids } = useTxMeta()
	const deliveryPending = useCrossChainDeliveryPending()
	const transactionActive = uids.some(
		({ submitted, broadcasted, pending }) =>
			(submitted && !broadcasted) || pending,
	)

	return syncing || transactionActive || deliveryPending ? (
		<span style={{ marginRight: '1rem' }}>
			<Spinner />
		</span>
	) : null
}
