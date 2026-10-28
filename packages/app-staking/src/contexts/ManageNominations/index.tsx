// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@polkadot-cloud/hooks'
import { NominationHealthProvider } from 'hooks/useNominationHealth'
import { Fragment, type ReactNode, useState } from 'react'
import type { AnyFunction, Validator } from 'types'
import type { ManageNominationsContextInterface } from './types'

export const [ManageNominationsContext, useManageNominations] =
	createSafeContext<ManageNominationsContextInterface>()

export const ManageNominationsProvider = ({
	children,
	nominations: initialNominations,
	initialMethod,
	provideNominationHealth = true,
}: {
	children: ReactNode
	nominations: Validator[]
	initialMethod?: string | null
	provideNominationHealth?: boolean
}) => {
	// The initially provided set of nominees
	const [defaultNominations] = useState<Validator[]>(initialNominations)

	// The set of nominations, defaults to initial provided nominees
	const [nominations, setNominations] =
		useState<Validator[]>(initialNominations)

	const defaultNominationsCount = defaultNominations.length

	// Store the method of fetching nominees
	const [method, setMethod] = useState<string | null>(
		initialMethod === undefined
			? defaultNominationsCount
				? 'Manual'
				: null
			: initialMethod,
	)
	// Store whether validators are being fetched
	const [fetching, setFetching] = useState(false)

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

	const HealthProvider = provideNominationHealth
		? NominationHealthProvider
		: Fragment

	return (
		<HealthProvider>
			<ManageNominationsContext.Provider
				value={{
					method,
					setMethod,
					fetching,
					setFetching,
					defaultNominations,
					nominations,
					setNominations,
					updateSetters,
				}}
			>
				{children}
			</ManageNominationsContext.Provider>
		</HealthProvider>
	)
}
