// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog, faPlug } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from 'contexts/Themes'
import { useState } from 'react'
import { ButtonHeader } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { ConnectPopover } from './Popovers/ConnectPopover'
import { MenuPopover } from './Popovers/MenuPopover'
import type { ToggleConnectProps } from './Popovers/types'

export const Settings = ({
	openConnect,
	setOpenConnect,
}: ToggleConnectProps) => {
	const { themeElementRef } = useTheme()

	const [openSettings, setOpenSettings] = useState<boolean>(false)

	return (
		<>
			<Popover
				open={openConnect}
				portalContainer={themeElementRef.current || undefined}
				content={<ConnectPopover setOpen={setOpenConnect} />}
				onTriggerClick={() => {
					setOpenConnect(!openConnect)
				}}
				width="350px"
			>
				<ButtonHeader className="header-connect" icon={faPlug} />
			</Popover>
			<Popover
				open={openSettings}
				portalContainer={themeElementRef.current || undefined}
				content={<MenuPopover setOpen={setOpenSettings} />}
				onTriggerClick={() => {
					setOpenSettings(!openSettings)
				}}
			>
				<ButtonHeader className="header-settings" icon={faCog} />
			</Popover>
		</>
	)
}
