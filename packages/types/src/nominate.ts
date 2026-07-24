// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type BondFor = 'pool' | 'nominator'

export interface Nominations {
	targets: string[]
	submittedIn: number
}

export type NominationStatus = 'active' | 'inactive' | 'waiting'

export type Nominator = Nominations & {
	suppressed: boolean
}

export type NominatorsMultiQuery = (Nominator | undefined)[]
