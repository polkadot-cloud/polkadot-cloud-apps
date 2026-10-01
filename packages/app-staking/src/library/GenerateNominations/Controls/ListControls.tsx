// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCaretDown,
	faMagnifyingGlass,
	faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
import { Tooltip } from 'ui-core/base'
import { MenuItemButton } from 'ui-core/popover'
import classes from './index.module.scss'
import { MenuPopover } from './MenuPopover'
import type { ListControlsProps } from './types'

export const ListControls = ({
	filterHandlers,
	disabled = false,
}: ListControlsProps) => {
	const { themeElementRef } = useTheme()
	const { t } = useTranslation('app')
	const [otherOpen, setOtherOpen] = useState(false)
	const otherValidators = filterHandlers.filter(
		({ group }) => group === 'other',
	)
	const otherDisabled =
		disabled || otherValidators.every((handler) => handler.isDisabled())

	return (
		<>
			{filterHandlers
				.filter(({ group }) => group === 'cloud')
				.map((handler) => {
					const isDisabled = disabled || handler.isDisabled()
					return isDisabled && handler.disabledTooltip ? (
						<Tooltip
							container={themeElementRef.current || undefined}
							key={handler.title}
							side="top"
							text={handler.disabledTooltip}
						>
							{/* Keep the unavailable action focusable so its explanation is accessible. */}
							<button aria-disabled="true" type="button">
								<ButtonMenu
									asLabel
									disabled
									iconLeft={handler.icon}
									text={handler.title}
								/>
							</button>
						</Tooltip>
					) : (
						<ButtonMenu
							text={handler.title}
							key={handler.title}
							disabled={isDisabled}
							onClick={handler.onClick}
							iconLeft={handler.icon}
						/>
					)
				})}
			{otherValidators.length > 0 && (
				<MenuPopover
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
					width="min(260px, calc(100vw - 2rem))"
				>
					<ButtonMenu
						asLabel
						disabled={otherDisabled}
						iconLeft={faPlus}
						iconRight={faCaretDown}
						text={t('otherValidators')}
					/>
				</MenuPopover>
			)}
			{filterHandlers
				.filter(({ group }) => group === 'search')
				.map((handler) => (
					<ButtonMenu
						className="searchButton"
						key={handler.title}
						disabled={disabled || handler.isDisabled()}
						onClick={handler.onClick}
						iconLeft={handler.icon || faMagnifyingGlass}
						text={handler.title}
					/>
				))}
		</>
	)
}
