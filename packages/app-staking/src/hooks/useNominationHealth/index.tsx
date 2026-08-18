// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { usePlugins } from 'hooks/usePlugins'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
	const [fixing, setFixing] = useState(false)
	const [fixRequest, setFixRequest] = useState(0)
	const [hasDangerWarnings, setHasDangerWarnings] = useState(false)
	const stakingApiEnabled = pluginEnabled('staking_api')

	const requestFix = useCallback(() => {
		setFixRequest((current) => current + 1)
	}, [])
	const toggleEnabled = useCallback((nextEnabled: boolean) => {
		setEnabled(nextEnabled)
		if (!nextEnabled) {
			setHasDangerWarnings(false)
		}
	}, [])

	return (
		<NominationHealthContext.Provider
			value={{
				active: stakingApiEnabled && enabled,
				enabled,
				fixing,
				fixRequest,
				hasDangerWarnings,
				requestFix,
				setHasDangerWarnings,
				setFixing,
				stakingApiEnabled,
				toggleEnabled,
			}}
		>
			{children}
		</NominationHealthContext.Provider>
	)
}

export const useNominationHealth = ({
	hasDangerWarnings,
	isFixing,
	onFix,
	validatorsToFix,
}: NominationHealthSync = {}) => {
	const context = useNominationHealthContext()
	const lastFixRequest = useRef(context.fixRequest)

	useEffect(() => {
		if (hasDangerWarnings === undefined) {
			return
		}

		context.setHasDangerWarnings(hasDangerWarnings)
		return () => context.setHasDangerWarnings(false)
	}, [context.setHasDangerWarnings, hasDangerWarnings])

	useEffect(() => {
		if (isFixing === undefined) {
			return
		}

		context.setFixing(isFixing)
		return () => context.setFixing(false)
	}, [context.setFixing, isFixing])

	useEffect(() => {
		if (
			!onFix ||
			!validatorsToFix ||
			context.fixRequest === lastFixRequest.current
		) {
			return
		}

		lastFixRequest.current = context.fixRequest
		if (hasDangerWarnings && validatorsToFix.length > 0) {
			void onFix(validatorsToFix)
		}
	}, [context.fixRequest, hasDangerWarnings, onFix, validatorsToFix])

	return context
}
