// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useList } from 'contexts/List'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import type { Validator } from 'types'
import { ButtonMonoInvert, ButtonPrimaryInvert } from 'ui-buttons'
import { Popover } from 'ui-core/popover'
import type { ListControlsProps } from './types'
import { InlineControlsWrapper } from './Wrappers'

export const ListControls = ({
	selectHandler,
	filterHandlers,
	standalone = false,
}: ListControlsProps) => {
	const provider = useList()
	const { themeElementRef } = useTheme()

	// Get selected items
	const { selected, resetSelected } = provider
	// This provider only wraps the validator list in this workflow.
	const selectedValidators = selected as Validator[]

	// Remove confirmation popover state
	const [open, setOpen] = useState(false)
	const Confirmation = selectHandler.popover.node

	return (
		<InlineControlsWrapper $standalone={standalone}>
			{selected.length > 0 && (
				<Popover
					open={open}
					portalContainer={themeElementRef.current || undefined}
					onTriggerClick={() => setOpen(true)}
					content={
						<Confirmation
							text={selectHandler.popover.text}
							controlKey="removeSelected"
							onClose={() => setOpen(false)}
							onRevert={() => {
								selectHandler.popover.callback({
									selected: selectedValidators,
									callback: resetSelected,
								})
								setOpen(false)
							}}
						/>
					}
				>
					<ButtonPrimaryInvert text={selectHandler.title} asLabel marginRight />
				</Popover>
			)}
			{filterHandlers.map((handler) => (
				<ButtonMonoInvert
					text={handler.title}
					key={`a_all_${handler.title}`}
					disabled={handler.isDisabled()}
					onClick={handler.onClick}
					iconLeft={handler.icon}
					marginRight
				/>
			))}
		</InlineControlsWrapper>
	)
}
