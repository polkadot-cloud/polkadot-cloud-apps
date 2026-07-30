// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from 'hooks'
import { useState } from 'react'
import { ButtonHeader } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import { BalancesPopover } from './BalancesPopover'

export const Wallet = () => {
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)

	return (
		<Popover
			open={open}
			portalContainer={themeElementRef.current || undefined}
			content={<BalancesPopover setOpen={setOpen} />}
			onTriggerClick={() => setOpen(!open)}
		>
			<ButtonHeader className="header-wallet" icon={faWallet} />
		</Popover>
	)
}
