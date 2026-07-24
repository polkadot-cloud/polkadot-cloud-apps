// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBell } from '@fortawesome/free-solid-svg-icons'
import { useInvites } from 'hooks/useInvites'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { ButtonHeader } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { NotificationsPopover } from './Popovers/NotificationsPopover'

export const Notifications = () => {
	const { themeElementRef } = useTheme()
	const { acknowledged, setAcknowledged } = useInvites()

	const [open, setOpen] = useState<boolean>(false)

	return (
		<Popover
			open={open}
			portalContainer={themeElementRef.current || undefined}
			content={<NotificationsPopover setOpen={setOpen} />}
			onTriggerClick={() => {
				setAcknowledged(true)
				setOpen(!open)
			}}
			width="350px"
		>
			<ButtonHeader
				className="header-notifications"
				icon={faBell}
				active={!acknowledged}
				acknowledged={acknowledged}
			/>
		</Popover>
	)
}
