// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect, useState } from 'react'

interface ValidatorStatus {
	key: string | null
	isValidator: boolean
	loading: boolean
}

const EMPTY_STATUS: ValidatorStatus = {
	key: null,
	isValidator: false,
	loading: false,
}

export const useValidatorStatus = () => {
	const { activeAddress } = useActiveAccount()
	const { isReady, serviceApi } = useApi()
	const { network } = useNetwork()
	const queryKey = activeAddress ? `${network}:${activeAddress}` : null
	const [status, setStatus] = useState<ValidatorStatus>(EMPTY_STATUS)

	useEffect(() => {
		if (!activeAddress || !queryKey) {
			setStatus(EMPTY_STATUS)
			return
		}
		if (!isReady) {
			return
		}

		let cancelled = false
		setStatus({ key: queryKey, isValidator: false, loading: true })

		const fetchValidatorStatus = async () => {
			try {
				const isValidator =
					await serviceApi.query.validatorExists(activeAddress)
				if (!cancelled) {
					setStatus({
						key: queryKey,
						isValidator,
						loading: false,
					})
				}
			} catch {
				if (!cancelled) {
					setStatus({ key: queryKey, isValidator: false, loading: false })
				}
			}
		}

		fetchValidatorStatus()

		return () => {
			cancelled = true
		}
	}, [activeAddress, isReady, queryKey, serviceApi])

	return {
		isLoading: Boolean(queryKey && (status.key !== queryKey || status.loading)),
		isValidator: status.key === queryKey && status.isValidator,
	}
}
