// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominationStatus, ServiceInterface } from 'types'

export type NodeFetcher = (
	node: ServiceInterface,
	era: number,
	who: string,
	signal: AbortSignal,
) => Promise<NominationStatus>
