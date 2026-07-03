// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Configuration } from '@polkawatch/ddp-client'
import type { NetworkId } from 'types'
import { PolkawatchConfig } from '../plugins'

// Get polkawatch configuration for a given network
export const getPolkawatchConfig = (network: NetworkId): Configuration =>
	new Configuration({
		basePath: `https://${network}-${PolkawatchConfig.ApiVersion}-api.polkawatch.app`,
	})
