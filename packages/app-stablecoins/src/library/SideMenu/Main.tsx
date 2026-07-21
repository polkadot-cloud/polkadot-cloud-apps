// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useUi } from 'hooks/useUi'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Primary } from 'ui-app/SideMenu'

export const Main = () => {
	const { t } = useTranslation('app')
	const { pathname } = useLocation()
	const { sideMenuMinimised } = useUi()

	return (
		<div className="inner">
			<Primary
				name={t('send')}
				to="/send"
				active={pathname === '/send'}
				faIcon={faPaperPlane}
				minimised={sideMenuMinimised}
			/>
		</div>
	)
}
