// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const proxy = <T extends StakingChain>(
	api: DedotClient<T>,
	real: string,
	call: SubmittableExtrinsic,
): SubmittableExtrinsic => {
	// @ts-expect-error Proxy type too complex to determine
	const tx = asTx(api.tx.proxy.proxy(real, undefined, call.call))
	return tx
}
