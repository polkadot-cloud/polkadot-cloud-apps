// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { emitNotification } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
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
	const { t } = useTranslation('app')
	const { isReady } = useApi()
	const { pluginEnabled } = usePlugins()
	const api = pluginEnabled('staking_api')
	const { activeAddress } = useActiveAccount()
	const { validatorOverviews } = useEraStakers()
	const { getValidators, validatorsFetched } = useValidators()

	// Track whether a fetch is already in progress to avoid duplicate requests.
	const fetchingRef = useRef(false)
	const { network } = useNetwork()
	const scope = `${network}:${activeAddress}:${api}`
	const scopeRef = useRef<string | null>(scope)
	useEffect(() => {
		scopeRef.current = scope
		return () => {
			scopeRef.current = null
		}
	}, [scope])

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

	// Generate only after validator and era data are ready, with one request in flight.
	useEffect(() => {
		const dataReady =
			api ||
			(isReady &&
				Boolean(getValidators()?.length) &&
				!!validatorOverviews &&
				validatorsFetched === 'synced')

		if (!fetching || !method || !dataReady || fetchingRef.current) {
			return
		}

		fetchingRef.current = true
		const generateNominations = async () => {
			try {
				const next = await fetchNominations(method)
				if (scopeRef.current === scope) updateNominations(next)
			} catch {
				if (scopeRef.current === scope)
					emitNotification({
						title: t('errorUnknown'),
						subtitle: t('tryAgain'),
					})
			} finally {
				setFetching(false)
				fetchingRef.current = false
			}
		}
		generateNominations()
	})

	// Release the temporary list height whenever the viewport changes.
	useEffect(() => {
		const resetHeight = () => setHeight(null)
		window.addEventListener('resize', resetHeight)
		return () => window.removeEventListener('resize', resetHeight)
	}, [])
}
