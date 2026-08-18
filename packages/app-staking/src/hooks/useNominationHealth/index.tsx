// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { usePlugins } from 'hooks/usePlugins'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { Validator } from 'types'
import type {
	NominationHealthContextInterface,
	NominationHealthSync,
} from './types'

const [NominationHealthContext, useNominationHealthContext] =
	createSafeContext<NominationHealthContextInterface>()

export const NominationHealthProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const { pluginEnabled } = usePlugins()
	const [enabled, setEnabled] = useState(true)
	const [hasDangerWarnings, setHasDangerWarnings] = useState(false)
	const [validatorsBelowThreshold, setValidatorsBelowThreshold] = useState<
		Validator[]
	>([])
	const stakingApiEnabled = pluginEnabled('staking_api')

	const toggleEnabled = useCallback((nextEnabled: boolean) => {
		setEnabled(nextEnabled)
		if (!nextEnabled) {
			setHasDangerWarnings(false)
			setValidatorsBelowThreshold([])
		}
	}, [])

	return (
		<NominationHealthContext.Provider
			value={{
				active: stakingApiEnabled && enabled,
				enabled,
				hasDangerWarnings,
				setHasDangerWarnings,
				setValidatorsBelowThreshold,
				stakingApiEnabled,
				toggleEnabled,
				validatorsBelowThreshold,
			}}
		>
			{children}
		</NominationHealthContext.Provider>
	)
}

export const useNominationHealth = ({
	hasDangerWarnings,
	validatorsBelowThreshold,
}: NominationHealthSync = {}) => {
	const context = useNominationHealthContext()

	useEffect(() => {
		if (hasDangerWarnings === undefined) {
			return
		}

		context.setHasDangerWarnings(hasDangerWarnings)
		return () => context.setHasDangerWarnings(false)
	}, [context.setHasDangerWarnings, hasDangerWarnings])

	useEffect(() => {
		if (validatorsBelowThreshold === undefined) {
			return
		}

		context.setValidatorsBelowThreshold(validatorsBelowThreshold)
		return () => context.setValidatorsBelowThreshold([])
	}, [context.setValidatorsBelowThreshold, validatorsBelowThreshold])

	return context
}
