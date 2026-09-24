// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useUi } from 'hooks/useUi'
import { NominationHealthSetting } from 'library/ManageNominations/NominationHealthSetting'
import { Sync } from 'library/Sync'
import { useState } from 'react'
import { Account, type MenuPopoverFeatureFlags, Settings } from 'ui-app/Headers'
import { Chat } from 'ui-chat'
import { Header } from 'ui-core/base'

const menuPopoverFeatures = {
	network: false,
	advancedMode: false,
	helpPrompts: false,
	share: false,
	plugins: false,
	syncAccounts: false,
	sendModal: false,
} satisfies MenuPopoverFeatureFlags

export const Headers = () => {
	const { sideMenuMinimised } = useUi()
	const { activeAddress } = useActiveAccount()
	const { getStakingLedger } = useBalances()
	const { activePool, isOwner } = useActivePool()
	// Match the nomination editor: pool owners manage the pool's nominations.
	const nominations = activeAddress
		? activePool && isOwner()
			? activePool.nominators.targets
			: getStakingLedger(activeAddress).nominators?.targets
		: undefined
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
				<Chat
					currentNominations={nominations}
					endpoint={
						import.meta.env.VITE_MESSAGING_URL ||
						(import.meta.env.MESSAGING_DEV_PROXY
							? window.location.origin
							: 'https://apps-ws.polkadot.cloud')
					}
				/>
			</section>
		</Header>
	)
}
