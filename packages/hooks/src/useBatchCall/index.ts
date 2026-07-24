// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { ActiveProxy, MaybeAddress } from 'types'
import { useApi } from '../useApi'
import { useProxySupported } from '../useProxySupported'

export const useBatchCall = () => {
	const { serviceApi } = useApi()
	const { isProxySupported } = useProxySupported()

	const newBatchCall = (
		txs: SubmittableExtrinsic[],
		from: MaybeAddress,
		activeProxy: ActiveProxy | null,
	): SubmittableExtrinsic | undefined => {
		from = from || ''
		const batchTx = serviceApi.tx.batch(txs)
		// If the active proxy supports this call, wrap each batch call in a proxy call
		if (
			activeProxy &&
			batchTx &&
			isProxySupported(batchTx, from, activeProxy)
		) {
			return serviceApi.tx.batch(
				txs
					.map((tx) => serviceApi.tx.proxy(from, tx))
					.filter((tx) => tx !== undefined),
			)
		} else {
			return batchTx
		}
	}

	return {
		newBatchCall,
	}
}
