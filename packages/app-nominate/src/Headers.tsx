// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import CloudSVG from 'assets/icons/cloud.svg?react'
import { AccountStatus } from 'library/AccountStatus'
import { NominationHealthSetting } from 'library/ManageNominations/NominationHealthSetting'
import { Sync } from 'library/Sync'
import { useState } from 'react'
import { Account, type MenuPopoverFeatureFlags, Settings } from 'ui-app/Headers'
import { Header } from 'ui-core/base'
import classes from './Headers.module.scss'

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
	const [openConnect, setOpenConnect] = useState(false)

	return (
		<Header standalone>
			<section className={classes.identity}>
				<div className={classes.brand}>
					<CloudSVG aria-hidden="true" />
					<span>Cloud</span>
				</div>
				<AccountStatus />
			</section>
			<section className={classes.controls}>
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
