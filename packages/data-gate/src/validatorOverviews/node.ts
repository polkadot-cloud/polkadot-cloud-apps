// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { queryOptions } from '@tanstack/react-query'
import type { NetworkId, ServiceInterface } from 'types'

// Overview readers and node exposure scans share the same raw snapshot.
export const nodeValidatorOverviewsOptions = (
	node: ServiceInterface,
	network: NetworkId,
	era: number,
) =>
	queryOptions({
		queryKey: ['validator-overviews', network, era],
		queryFn: () => node.query.erasStakersOverviewEntries(era),
		staleTime: Infinity,
	})
