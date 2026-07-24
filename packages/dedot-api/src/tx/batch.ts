// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type { StakingChain } from '../types'
import { asTx } from '../util'

export const batch = <T extends StakingChain>(
	api: DedotClient<T>,
	calls: SubmittableExtrinsic[],
): SubmittableExtrinsic => {
	// @ts-expect-error Batch calls are too complex for type inference
	const tx = asTx(api.tx.utility.batch(calls.map((call) => call.call)))
	return tx
}
