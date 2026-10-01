// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonMenu } from 'ui-buttons'
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
						text={handler.title}
						key={handler.title}
						disabled={disabled || handler.isDisabled()}
						onClick={handler.onClick}
						iconLeft={handler.icon}
					/>
				))}
		</>
	)
}
