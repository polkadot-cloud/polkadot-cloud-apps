// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainMetadata, NominatorDetail } from '@polkawatch/ddp-client'
import type { ListFormat } from 'contexts/List/types'

export type { ChainMetadata, NominatorDetail } from '@polkawatch/ddp-client'

export interface AnalyzedPayoutsProps {
	data?: NominatorDetail
}

export interface AnalyzedErasProps {
	meta?: ChainMetadata
}

export interface NomninationGeoListProps {
	title: string
	data?: NominatorDetail
}

export interface NominationGeoListContextInterface {
	setListFormat: (v: ListFormat) => void
	listFormat: ListFormat
}
