// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'hooks/useUi'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Primary } from 'ui-app/SideMenu'
import { pages } from '../../pages'

export const Main = () => {
	const { t } = useTranslation('app')
	const { pathname } = useLocation()
	const { sideMenuMinimised } = useUi()

	return (
		<div className="inner">
			{pages.map((page) => (
				<Primary
					key={page.key}
					name={t(page.key)}
					to={page.hash}
					active={pathname === page.hash}
					faIcon={page.faIcon}
					minimised={sideMenuMinimised}
				/>
			))}
		</div>
	)
}
