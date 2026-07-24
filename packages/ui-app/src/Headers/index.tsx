// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'hooks/useUi'
import { useState } from 'react'
import { Header } from 'ui-core/base'
import { Account } from './Account'
import { Notifications } from './Notifications'
import { Settings } from './Settings'
import { SideMenuToggle } from './SideMenuToggle'
import type { HeadersProps } from './types'

export type { HeadersProps, MenuPopoverFeatureFlags } from './types'

export const Headers = ({
	NodesLeft,
	NodesRight,
	menuPopoverFeatures,
}: HeadersProps) => {
	const { sideMenuMinimised } = useUi()

	// Whether the connect popover is open
	const [openConnect, setOpenConnect] = useState<boolean>(false)

	return (
		<Header minimized={sideMenuMinimised}>
			<section>
				<SideMenuToggle />
			</section>
			<section>
				{Object.entries(NodesLeft || {}).map(([key, Component]) => (
					<Component key={key} />
				))}
				<Account openConnect={openConnect} setOpenConnect={setOpenConnect} />
				{Object.entries(NodesRight || {}).map(([key, Component]) => (
					<Component key={key} />
				))}
				<Notifications />
				<Settings
					openConnect={openConnect}
					setOpenConnect={setOpenConnect}
					menuPopoverFeatures={menuPopoverFeatures}
				/>
			</section>
		</Header>
	)
}
