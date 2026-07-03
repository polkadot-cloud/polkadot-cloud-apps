// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCalendarXmark,
	faCircleUp,
	faTrashCan,
} from '@fortawesome/free-regular-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { poolWarnings$ } from 'global-bus'
import type { WarningMessage } from 'pages/Overview/Summaries/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const useWarnings = () => {
	const { t } = useTranslation('app')
	const { activeAddress } = useActiveAccount()
	const [warningMessages, setWarningMessages] = useState<WarningMessage[]>([])

	useEffect(() => {
		const subscription = poolWarnings$.subscribe((poolWarnings) => {
			if (!activeAddress) {
				setWarningMessages([])
				return
			}

			const warnings = poolWarnings[activeAddress] || []
			const messages: WarningMessage[] = []

			warnings.forEach((warning) => {
				if (warning.type === 'DESTROYING') {
					messages.push({
						value: t('warnings.destroyingTitle'),
						description: t('warnings.destroyingDescription'),
						format: 'danger',
						faIcon: faTrashCan,
					})
				} else if (warning.type === 'HIGH_COMMISSION') {
					messages.push({
						value: t('warnings.highCommissionTitle'),
						faIcon: faCircleUp,
						description: t('warnings.highCommissionDescription'),
						format: 'warning',
					})
				} else if (warning.type === 'NO_CHANGE_RATE') {
					messages.push({
						value: t('warnings.noChangeRateTitle'),
						faIcon: faCalendarXmark,
						description: t('warnings.noChangeRateDescription'),
						format: 'warning',
					})
				}
			})

			setWarningMessages(messages)
		})

		return () => subscription.unsubscribe()
	}, [activeAddress])

	const getMostSevereWarningFormat = () => {
		// Danger is more severe than warning, so return danger if any danger messages exist
		const hasDanger = warningMessages.some(
			(message) => message.format === 'danger',
		)
		return hasDanger ? 'danger' : 'warning'
	}

	return { warningMessages, getMostSevereWarningFormat }
}
