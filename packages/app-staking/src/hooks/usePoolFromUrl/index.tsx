// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { extractUrlValue } from '@w3ux/utils'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { emitNotification } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useUi } from 'hooks/useUi'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useOverlay } from 'ui-overlay'

export const usePoolFromUrl = () => {
	const { t } = useTranslation('app')
	const { isReady } = useApi()
	const { search } = useLocation()
	const { setAdvancedMode } = useUi()
	const { bondedPools } = useBondedPools()
	const { openCanvas, setCanvasConfig, status } = useOverlay().canvas

	// Track the pool id that was last opened from a URL param
	const openedRef = useRef<string | null>(null)

	useEffect(() => {
		if (!isReady || bondedPools.length === 0) {
			return
		}

		// If a validator param is present, do not process pool param, as validator param takes
		// precedence
		if (extractUrlValue('v')) {
			return
		}

		const poolId = extractUrlValue('p')
		if (!poolId || poolId === openedRef.current) {
			return
		}

		const id = Number(poolId)
		if (isNaN(id)) {
			emitNotification({
				title: t('invalidPoolId'),
				subtitle: `${t('poolNotFound')}: ${poolId}`,
			})
			openedRef.current = poolId
			return
		}

		const pool = bondedPools.find((bp) => Number(bp.id) === id)
		if (!pool) {
			emitNotification({
				title: t('invalidPoolId'),
				subtitle: `${t('poolNotFound')}: ${poolId}`,
			})
			openedRef.current = poolId
			return
		}

		const config = {
			key: 'Pool',
			options: {
				providedPool: {
					id,
				},
			},
			size: 'xl' as const,
		}

		openedRef.current = poolId

		// Enable advanced mode when a valid pool is discovered from the URL
		setAdvancedMode(true)

		// If canvas is already open, swap the content in place
		if (status === 'open') {
			setCanvasConfig(config)
		} else if (status === 'closed') {
			openCanvas(config)
		}
	}, [isReady, bondedPools.length, search, status])
}
