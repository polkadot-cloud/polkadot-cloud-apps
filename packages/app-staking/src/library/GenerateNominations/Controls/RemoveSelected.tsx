// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useList } from 'contexts/List'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Validator } from 'types'
import type { SelectHandler } from '../types'
import { MenuPopover } from './MenuPopover'

export const RemoveSelected = ({
	disabled,
	selectHandler,
	target,
}: {
	disabled: boolean
	selectHandler: SelectHandler
	target?: HTMLDivElement | null
}) => {
	const { selected, resetSelected } = useList()
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)
	const Confirmation = selectHandler.popover.node

	if (!target || selected.length === 0) return null

	// Retain the list's selection context while placing the action beside its title.
	return createPortal(
		<MenuPopover
			align="end"
			content={
				<Confirmation
					text={selectHandler.popover.text}
					controlKey="removeSelected"
					onClose={() => setOpen(false)}
					onRevert={() => {
						selectHandler.popover.callback({
							selected: selected as Validator[],
							callback: resetSelected,
						})
						setOpen(false)
					}}
				/>
			}
			disabled={disabled}
			onOpenChange={setOpen}
			open={open}
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
		>
			<span>{selectHandler.title}</span>
		</MenuPopover>,
		target,
	)
}
