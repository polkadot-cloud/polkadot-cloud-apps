// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useDataCapabilities, useDataGate } from 'data-gate/react'
import { emitNotification } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'

interface UseNominationSyncProps {
	fetchNominations: (method: string) => Promise<Validator[]>
	updateNominations: (nominations: Validator[]) => void
}

export const useNominationSync = ({
	fetchNominations,
	updateNominations,
}: UseNominationSyncProps) => {
	const { t } = useTranslation('app')
	const {
		eraStakers: { stakers },
	} = useEraStakers()
	const { isReady } = useApi()
	const gate = useDataGate()
	const { candidates } = useDataCapabilities()
	const {
		defaultNominations,
		fetching,
		method,
		nominations,
		setFetching,
		setHeight,
		setMethod,
		setNominations,
	} = useManageNominations()
	const { activeAddress } = useActiveAccount()
	const { validatorsFetched } = useValidators()

	// Reset only when the account or initial nominations change, not during edits.
	useEffect(() => {
		if (
			defaultNominations.length > 0 &&
			JSON.stringify(nominations) !== JSON.stringify(defaultNominations)
		) {
			setNominations([...defaultNominations])
			setMethod('manual')
		}
	}, [activeAddress, defaultNominations])

	const dataReady =
		(candidates && method === 'Optimal Selection') ||
		(isReady && validatorsFetched === 'synced' && stakers.length > 0)
	const callbacks = useRef({ fetchNominations, updateNominations })
	callbacks.current = { fetchNominations, updateNominations }
	useEffect(() => {
		if (!fetching || !method || !dataReady) return
		let cancelled = false
		const generate = async () => {
			try {
				const result = await callbacks.current.fetchNominations(method)
				if (!cancelled) callbacks.current.updateNominations(result)
			} catch {
				if (!cancelled)
					emitNotification({
						title: t('dataUnavailable', {
							ns: 'app',
							defaultValue: 'Unable to load data.',
						}),
						subtitle: t('tryAgain', {
							ns: 'app',
							defaultValue: 'Please try again.',
						}),
					})
			} finally {
				if (!cancelled) setFetching(false)
			}
		}
		void generate()
		return () => {
			cancelled = true
		}
	}, [fetching, method, dataReady, activeAddress, gate])

	// Release the temporary list height whenever the viewport changes.
	useEffect(() => {
		const resetHeight = () => setHeight(null)
		window.addEventListener('resize', resetHeight)
		return () => window.removeEventListener('resize', resetHeight)
	}, [])
}
