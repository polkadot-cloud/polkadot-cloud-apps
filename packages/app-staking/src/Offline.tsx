// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWarning } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { listenOnlineStatus, onlineStatus$ } from 'global-bus'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Offline as Wrapper } from 'ui-core/base'

export const Offline = () => {
	const { t } = useTranslation('app')
	const [offline, setOffline] = useState<boolean>(false)

	useEffect(() => {
		listenOnlineStatus()
	}, [])

	// Listen to global bus online status
	useEffect(() => {
		const subOnlineStatus = onlineStatus$.subscribe((result) => {
			setOffline(!result.online)
		})
		return () => {
			subOnlineStatus.unsubscribe()
		}
	}, [])

	if (!offline) {
		return null
	}
	return (
		<Wrapper>
			<FontAwesomeIcon icon={faWarning} transform="grow-4" />
			<h3>{t('offline')}</h3>
		</Wrapper>
	)
}
