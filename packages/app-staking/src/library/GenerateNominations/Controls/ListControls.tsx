// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useList } from 'contexts/List'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Validator } from 'types'
import { ButtonMenu } from 'ui-buttons'
import { MenuItemButton, Popover } from 'ui-core/popover'
import classes from './index.module.scss'
import type { ListControlsProps } from './types'

export const ListControls = ({
	selectHandler,
	filterHandlers,
	disabled = false,
}: ListControlsProps) => {
	const { selected, resetSelected } = useList()
	const { themeElementRef } = useTheme()
	const { t } = useTranslation('app')
	const [open, setOpen] = useState(false)
	const [otherOpen, setOtherOpen] = useState(false)
	const Confirmation = selectHandler.popover.node
	const otherValidators = filterHandlers.filter(
		({ group }) => group === 'other',
	)
	const otherDisabled =
		disabled || otherValidators.every((handler) => handler.isDisabled())

	return (
		<>
			{filterHandlers
				.filter(({ group }) => group === 'cloud')
				.map((handler) => (
					<ButtonMenu
						text={handler.title}
						key={handler.title}
						disabled={disabled || handler.isDisabled()}
						onClick={handler.onClick}
						iconLeft={handler.icon}
					/>
				))}
			{otherValidators.length > 0 && (
				<Popover
					align="start"
					content={
						<div className={classes.otherValidatorsMenu}>
							{otherValidators.map((handler) => (
								<MenuItemButton
									className={classes.candidateButton}
									disabled={disabled || handler.isDisabled()}
									key={handler.title}
									onClick={() => {
										handler.onClick()
										setOtherOpen(false)
									}}
								>
									{handler.icon && (
										<FontAwesomeIcon aria-hidden icon={handler.icon} />
									)}
									{handler.title}
								</MenuItemButton>
							))}
						</div>
					}
					disabled={otherDisabled}
					onOpenChange={setOtherOpen}
					open={otherOpen}
					portalContainer={themeElementRef.current || undefined}
					side="bottom"
					sideOffset={8}
					width="min(260px, calc(100vw - 2rem))"
				>
					<ButtonMenu
						asLabel
						disabled={otherDisabled}
						iconLeft={faPlus}
						iconRight={faCaretDown}
						text={t('otherValidators')}
					/>
				</Popover>
			)}
			{['search', 'favorites'].flatMap((controlGroup) =>
				filterHandlers
					.filter(({ group }) => group === controlGroup)
					.map((handler) => (
						<ButtonMenu
							text={handler.title}
							key={handler.title}
							disabled={disabled || handler.isDisabled()}
							onClick={handler.onClick}
							iconLeft={handler.icon}
						/>
					)),
			)}
			{selected.length > 0 && (
				<Popover
					align="start"
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
					sideOffset={8}
				>
					<ButtonMenu
						asLabel
						disabled={disabled}
						status="danger"
						text={selectHandler.title}
					/>
				</Popover>
			)}
		</>
	)
}
