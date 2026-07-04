// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'contexts/UI'
import { Page } from 'ui-core/base'
import { NavSimple } from './NavSimple'

export const DefaultMenu = () => {
	const { sideMenuMinimised } = useUi()

	return (
		<Page.Side.Default
			open={false}
			minimised={sideMenuMinimised}
			nav={<NavSimple />}
		/>
	)
}
