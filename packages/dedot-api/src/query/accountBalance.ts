// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { Chain } from '../types'

export const accountBalance = async <T extends Chain>(
	api: DedotClient<T>,
	address: string,
) => {
	const result = await api.query.system.account(address)
	return result.data
}
