// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn } from '@w3ux/utils'
import type { AnyJson } from 'types'

/**
 * @name determinePoolDisplay
 * @summary A pool will be displayed with either its set metadata or its address.
 */
export const determinePoolDisplay = (address: string, batchItem: AnyJson) => {
	const defaultDisplay = ellipsisFn(address, 6)
	return batchItem || defaultDisplay
}
