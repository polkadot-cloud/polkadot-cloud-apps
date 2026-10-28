// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQuery } from '@tanstack/react-query'
import { useDataGate } from './provider'
import { dataPointOptions } from './query'
import type { DataPointConfig } from './types'

// Data-point modules declare their sources; data gate owns query execution and result state.
export const useDataPoint = <T, Selected = T>(
	config: DataPointConfig<T>,
	select?: (data: T) => Selected,
) => {
	// Re-evaluate source selection when the provider's network or plugin snapshot changes.
	useDataGate()
	const options = dataPointOptions(config)
	const { data, error, isPending, refetch } = useQuery({ ...options, select })
	return {
		data: options.enabled ? data : undefined,
		error,
		loading: !error && (!options.enabled || isPending),
		refetch,
	}
}
