// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'

// Basic API metrics support enhanced layouts independently of retainment and warnings.
export const useValidatorDetailsEnabled = () => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	return (
		pluginEnabled('staking_api') &&
		(network === 'polkadot' || network === 'kusama')
	)
}
