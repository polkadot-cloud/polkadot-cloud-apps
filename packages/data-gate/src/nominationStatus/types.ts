// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominationStatus, ServiceInterface } from 'types'

export type NodeStatusFetcher = (
	// This flow only needs these three queries from the shared service API.
	query: Pick<
		ServiceInterface['query'],
		'nominatorsMulti' | 'erasStakersOverview' | 'erasStakersPagedEntries'
	>,
	era: number,
	who: string,
	signal: AbortSignal,
) => Promise<NominationStatus>
