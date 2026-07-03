// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useNetwork } from 'hooks/useNetwork'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { defaultContext, defaultOperatorItem } from './defaults'
import type { Item, OperatorsSectionsContextInterface } from './types'

export const OperatorsSectionsContext =
	createContext<OperatorsSectionsContextInterface>(defaultContext)

export const useOperatorsSections = () => useContext(OperatorsSectionsContext)

export const OperatorsSectionsProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const { network } = useNetwork()

	// store the active section of the operators page
	const [activeSection, setActiveSectionState] = useState<number>(0)

	// store the active entity item of the operators page
	const [activeItem, setActiveItem] = useState<Item>(defaultOperatorItem)

	// store the Y scroll position when the last entity was visited
	// used to automatically scroll back down upon returning to the entity list.
	const [scrollPos, setScrollPos] = useState<number>(0)

	// go back to first section and reset item when network switches
	useEffect(() => {
		setActiveSectionState(0)
		setActiveItem(defaultOperatorItem)
	}, [network])

	const setActiveSection = (t: number) => {
		setActiveSectionState(t)
	}

	return (
		<OperatorsSectionsContext.Provider
			value={{
				activeSection,
				setActiveSection,
				activeItem,
				setActiveItem,
				scrollPos,
				setScrollPos,
			}}
		>
			{children}
		</OperatorsSectionsContext.Provider>
	)
}
