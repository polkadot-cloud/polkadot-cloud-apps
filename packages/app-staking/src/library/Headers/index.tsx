// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'hooks/useUi'
import { type ComponentType, useState } from 'react'
import { Header } from 'ui-core/base'
import { Account } from './Account'
import { Notifications } from './Notifications'
import { Settings } from './Settings'
import { SideMenuToggle } from './SideMenuToggle'

interface HeadersProps {
	Sync: ComponentType
}

export const Headers = ({ Sync }: HeadersProps) => {
	const { sideMenuMinimised } = useUi()

	// Whether the connect popover is open
	const [openConnect, setOpenConnect] = useState<boolean>(false)

	return (
		<Header minimized={sideMenuMinimised}>
			<section>
				<SideMenuToggle />
			</section>
			<section>
				<Sync />
				<Account openConnect={openConnect} setOpenConnect={setOpenConnect} />
				<Notifications />
				<Settings openConnect={openConnect} setOpenConnect={setOpenConnect} />
			</section>
		</Header>
	)
}
