// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

export interface ValidatorsTabsContextInterface {
	setActiveTab: (t: number) => void
	activeTab: number
}

export const ValidatorsTabsContext =
	createContext<ValidatorsTabsContextInterface>({
		// eslint-disable-next-line
		setActiveTab: (_t: number) => {},
		activeTab: 0,
	})

export const useValidatorsTabs = () => useContext(ValidatorsTabsContext)

export const ValidatorsTabsProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const tabFromUrl = extractUrlValue('t')
	const initialActiveTab = [0, 1].includes(Number(tabFromUrl))
		? Number(tabFromUrl)
		: 0

	const [activeTab, setActiveTabState] = useState<number>(initialActiveTab)

	const setActiveTab = (t: number) => {
		setActiveTabState(t)
	}

	return (
		<ValidatorsTabsContext.Provider
			value={{
				activeTab,
				setActiveTab,
			}}
		>
			{children}
		</ValidatorsTabsContext.Provider>
	)
}
