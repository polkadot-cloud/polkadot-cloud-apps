// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { KusamaService } from './kusama'
import { PaseoService } from './paseo'
import { PolkadotService } from './polkadot'
import { WestendService } from './westend'

export const Services = {
	polkadot: PolkadotService,
	kusama: KusamaService,
	westend: WestendService,
	paseo: PaseoService,
}
