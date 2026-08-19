// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useUi } from 'hooks/useUi'
import { Sync } from 'library/Sync'
import { useState } from 'react'
import { Account, type MenuPopoverFeatureFlags, Settings } from 'ui-app/Headers'
import { Header } from 'ui-core/base'
import { NominationHealthSetting } from './NominationHealthSetting'

const menuPopoverFeatures = {
	network: false,
	advancedMode: false,
	helpPrompts: false,
	share: false,
	plugins: false,
	docs: false,
	syncAccounts: false,
	sendModal: false,
} satisfies MenuPopoverFeatureFlags

export const Headers = () => {
	const { sideMenuMinimised } = useUi()
	const [openConnect, setOpenConnect] = useState(false)

	return (
		<Header minimized={sideMenuMinimised}>
			<section />
			<section>
				<Sync />
				<Account
					openConnect={openConnect}
					setOpenConnect={setOpenConnect}
					sendModal={false}
				/>
				<Settings
					openConnect={openConnect}
					setOpenConnect={setOpenConnect}
					menuPopoverFeatures={menuPopoverFeatures}
				>
					<NominationHealthSetting />
				</Settings>
			</section>
		</Header>
	)
}
