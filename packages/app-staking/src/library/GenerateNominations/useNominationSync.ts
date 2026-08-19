// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useEraStakers } from 'contexts/EraStakers'
import { useManageNominations } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useEffect, useRef } from 'react'
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
		eraStakers: { stakers },
	} = useEraStakers()
	const { isReady } = useApi()
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
	const { getValidators, validatorsFetched } = useValidators()

	// Track whether a fetch is already in progress to avoid duplicate requests.
	const fetchingRef = useRef(false)

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
			isReady &&
			Boolean(getValidators()?.length) &&
			Boolean(stakers.length) &&
			validatorsFetched === 'synced'

		if (!fetching || !method || !dataReady || fetchingRef.current) {
			return
		}

		fetchingRef.current = true
		const generateNominations = async () => {
			try {
				updateNominations(await fetchNominations(method))
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
