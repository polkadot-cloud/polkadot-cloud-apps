// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { KusamaService } from './kusama'
import { PaseoService } from './paseo'
import { PolkadotService } from './polkadot'

export const Services = {
	polkadot: PolkadotService,
	kusama: KusamaService,
	paseo: PaseoService,
}
