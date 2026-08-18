// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { usePlugins } from 'hooks/usePlugins'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type {
	NominationHealthContextInterface,
	NominationHealthState,
} from './types'

export const [NominationHealthContext, useNominationHealth] =
	createSafeContext<NominationHealthContextInterface>()

export const NominationHealthProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const { pluginEnabled } = usePlugins()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const [enabled, setEnabled] = useState(true)
	const [nominationHealth, setNominationHealth] =
		useState<NominationHealthState>({
			hasDangerWarnings: false,
			isLoading: false,
			lowRetainmentValidators: [],
		})
	const stakingApiEnabled = pluginEnabled('staking_api')

	return (
		<NominationHealthContext.Provider
			value={{
				...nominationHealth,
				active: retainmentStatsEnabled && enabled,
				enabled,
				retainmentStatsEnabled,
				setEnabled,
				setNominationHealth,
				stakingApiEnabled,
			}}
		>
			{children}
		</NominationHealthContext.Provider>
	)
}
