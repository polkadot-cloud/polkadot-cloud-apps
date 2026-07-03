// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from 'ui-overlay'
import { Proxies } from './Proxies'
import { ReadOnly } from './ReadOnly'

export const ExternalAccounts = () => {
	const { config } = useOverlay().modal
	const { options } = config

	const type = options?.type || 'read-only'

	switch (type) {
		case 'read-only':
			return <ReadOnly />
		case 'proxies':
			return <Proxies />
		default:
			return null
	}
}
