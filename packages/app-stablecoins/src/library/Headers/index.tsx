// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'contexts/UI'
import { useState } from 'react'
import { Header } from 'ui-core/base'
import { Account } from './Account'
import { Settings } from './Settings'
import { SideMenuToggle } from './SideMenuToggle'
import { Wallet } from './Wallet'

export const Headers = () => {
	const [openConnect, setOpenConnect] = useState<boolean>(false)
	const { sideMenuMinimised } = useUi()

	return (
		<Header minimized={sideMenuMinimised}>
			<section>
				<SideMenuToggle />
			</section>
			<section>
				<Account openConnect={openConnect} setOpenConnect={setOpenConnect} />
				<Wallet />
				<Settings openConnect={openConnect} setOpenConnect={setOpenConnect} />
			</section>
		</Header>
	)
}
