// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from 'library/Prompt/Confirm'
import { useState } from 'react'
import { MenuPopover } from './Controls/MenuPopover'
import type { ConfirmActionProps } from './types'

export const ConfirmAction = ({
	align = 'end',
	attached = true,
	children,
	controlKey,
	disabled = false,
	onConfirm,
	text,
}: ConfirmActionProps) => {
	const [open, setOpen] = useState(false)

	const confirm = () => {
		onConfirm()
		setOpen(false)
	}

	return (
		<MenuPopover
			align={align}
			attached={attached}
			content={
				<Confirm
					controlKey={controlKey}
					onClose={() => setOpen(false)}
					onRevert={confirm}
					text={text}
				/>
			}
			disabled={disabled}
			onOpenChange={setOpen}
			open={open}
		>
			{children}
		</MenuPopover>
	)
}
