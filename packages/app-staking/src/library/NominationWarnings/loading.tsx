// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { createContext, useState } from 'react'

export const NominationWarningsLoadingContext = createContext(false)
export const SetNominationWarningsLoadingContext = createContext<
	(isLoading: boolean) => void
>(() => {})

export const NominationWarningsLoadingProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const [isLoading, setIsLoading] = useState(false)

	return (
		<NominationWarningsLoadingContext.Provider value={isLoading}>
			<SetNominationWarningsLoadingContext.Provider value={setIsLoading}>
				{children}
			</SetNominationWarningsLoadingContext.Provider>
		</NominationWarningsLoadingContext.Provider>
	)
}
