// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import type { AnyFunction, Validator } from 'types'
import type { ManageNominationsContextInterface } from './types'

export const [ManageNominationsContext, useManageNominations] =
	createSafeContext<ManageNominationsContextInterface>()

export const ManageNominationsProvider = ({
	children,
	nominations: initialNominations,
}: {
	children: ReactNode
	nominations: Validator[]
}) => {
	// The initially provided set of nominees
	const [defaultNominations] = useState<Validator[]>(initialNominations)

	// The set of nominations, defaults to initial provided nominees
	const [nominations, setNominations] =
		useState<Validator[]>(initialNominations)

	const defaultNominationsCount = defaultNominations?.length || 0

	// Store the method of fetching nominees
	const [method, setMethod] = useState<string | null>(
		defaultNominationsCount ? 'Manual' : null,
	)
	// Store whether validators are being fetched
	const [fetching, setFetching] = useState<boolean>(false)

	// Store the height of the container
	const [height, setHeight] = useState<number | null>(null)

	// Ref for the height of the validator list container
	const heightRef = useRef<HTMLDivElement | null>(null)

	// Utility to update provided setters with new nominations
	const updateSetters = (
		setters: AnyFunction[],
		newNominations: Validator[],
	) => {
		for (const { current, set } of setters) {
			const currentValue = current?.callable ? current.fn() : current
			set({
				...currentValue,
				nominations: newNominations,
			})
		}
	}

	// Handle resetting manage nominations
	const resetNominations = (setters: AnyFunction[]) => {
		setMethod(null)
		setNominations([])
		updateSetters(setters, [])
	}

	// Handle reverting nomination changes
	const revertNominations = () => {
		// Set a temporary height to prevent height snapping on re-renders
		setHeight(heightRef.current?.clientHeight || null)
		setTimeout(() => setHeight(null), 200)
		setFetching(true)
	}

	return (
		<ManageNominationsContext.Provider
			value={{
				method,
				setMethod,
				fetching,
				setFetching,
				height,
				setHeight,
				defaultNominations,
				nominations,
				setNominations,
				heightRef,
				updateSetters,
				resetNominations,
				revertNominations,
			}}
		>
			{children}
		</ManageNominationsContext.Provider>
	)
}
