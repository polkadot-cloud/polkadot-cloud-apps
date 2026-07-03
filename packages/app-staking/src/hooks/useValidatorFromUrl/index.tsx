// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue } from '@w3ux/utils'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { emitNotification } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useUi } from 'hooks/useUi'
import { getIdentityDisplay } from 'library/List/Utils'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useOverlay } from 'ui-overlay'

export const useValidatorFromUrl = () => {
	const { t } = useTranslation('app')
	const { isReady } = useApi()
	const { search } = useLocation()
	const { openCanvas, setCanvasConfig, status } = useOverlay().canvas
	const { setAdvancedMode } = useUi()
	const {
		getValidators,
		validatorIdentities,
		validatorSupers,
		validatorsFetched,
	} = useValidators()

	// Track the validator address that was last opened from a URL param
	const openedRef = useRef<string | null>(null)

	useEffect(() => {
		if (!isReady || validatorsFetched !== 'synced') {
			return
		}

		// Wait until identity data has been fetched. Identities load after
		// validatorsFetched becomes 'synced', so we need to wait for them
		if (
			!Object.keys(validatorIdentities).length &&
			!Object.keys(validatorSupers).length
		) {
			return
		}

		const validator = extractUrlValue('v')
		if (!validator || validator === openedRef.current) {
			return
		}

		// Check if the address belongs to a known validator
		const allValidators = getValidators()
		const exists = allValidators.some((v) => v.address === validator)

		if (!exists) {
			emitNotification({
				title: t('invalidValidator'),
				subtitle: `${t('validatorNotFound')}: ${validator.substring(0, 16)}...`,
			})
			openedRef.current = validator
			return
		}

		const identityDisplay = getIdentityDisplay(
			validatorIdentities[validator],
			validatorSupers[validator],
		)
		const identity = identityDisplay.data?.display || validator

		const config = {
			key: 'ValidatorMetrics',
			options: {
				validator,
				identity,
			},
			size: 'xl' as const,
		}

		openedRef.current = validator

		// Enable advanced mode when a valid validator is discovered from the URL
		setAdvancedMode(true)

		// If canvas is already open, swap the content in place
		if (status === 'open') {
			setCanvasConfig(config)
		} else if (status === 'closed') {
			openCanvas(config)
		}
	}, [
		isReady,
		validatorsFetched,
		validatorIdentities,
		validatorSupers,
		search,
		status,
	])
}
