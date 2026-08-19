// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import { Confirm } from 'library/Prompt/Confirm'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Popover } from 'ui-core/popover'

export const ConfirmAction = ({
	align = 'end',
	children,
	controlKey,
	disabled = false,
	onConfirm,
	text,
}: {
	align?: 'start' | 'center' | 'end'
	children: ReactNode
	controlKey: string
	disabled?: boolean
	onConfirm: () => void
	text: string
}) => {
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)

	const confirm = () => {
		onConfirm()
		setOpen(false)
	}

	return (
		<Popover
			align={align}
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
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
			sideOffset={8}
		>
			{children}
		</Popover>
	)
}
