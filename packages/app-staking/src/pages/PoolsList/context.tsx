// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { PoolsTabsContextInterface } from './types'

export const PoolsTabsContext = createContext<PoolsTabsContextInterface>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setActiveTab: (_tab: number) => {},
	activeTab: 0,
})

export const usePoolsTabs = () => useContext(PoolsTabsContext)

export const PoolsTabsProvider = ({ children }: { children: ReactNode }) => {
	const tabFromUrl = extractUrlValue('t')
	const initialActiveTab = [0, 1, 2, 3].includes(Number(tabFromUrl))
		? Number(tabFromUrl)
		: 0

	const [activeTab, setActiveTabState] = useState<number>(initialActiveTab)

	const setActiveTab = (t: number) => {
		setActiveTabState(t)
	}

	return (
		<PoolsTabsContext.Provider
			value={{
				activeTab,
				setActiveTab,
			}}
		>
			{children}
		</PoolsTabsContext.Provider>
	)
}
