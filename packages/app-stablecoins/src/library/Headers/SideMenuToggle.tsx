// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUi } from 'contexts/UI'
import { MenuWrapper } from './Wrappers'

export const SideMenuToggle = () => {
	const { setSideMenu, sideMenuOpen } = useUi()

	return (
		<MenuWrapper>
			<button type="button" onClick={() => setSideMenu(!sideMenuOpen)}>
				<FontAwesomeIcon icon={faBars} transform="grow-2" />
			</button>
		</MenuWrapper>
	)
}
