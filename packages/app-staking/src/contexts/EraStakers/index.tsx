// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useValidatorOverviews } from 'data-gate/react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { EraStakersContextInterface } from './types'

export const [EraStakersContext, useEraStakers] =
	createSafeContext<EraStakersContextInterface>()

// Compatibility boundary for validator consumers. Only overview metadata is requested here;
// nomination status and backing are independent data-gate resources.
export const EraStakersProvider = ({ children }: { children: ReactNode }) => {
	const overviews = useValidatorOverviews()
	const stakers = useMemo(() => overviews.data ?? [], [overviews.data])
	const eraStakers = useMemo(
		() => ({ stakers, activeAccountOwnStake: [] }),
		[stakers],
	)
	return (
		<EraStakersContext.Provider
			value={{
				eraStakers,
				activeValidators: stakers.length,
				syncing: overviews.loading,
				error: overviews.error,
				getActiveValidator: (who) =>
					stakers.find((staker) => staker.address === who),
			}}
		>
			{children}
		</EraStakersContext.Provider>
	)
}
