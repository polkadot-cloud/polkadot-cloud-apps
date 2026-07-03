// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MenuItemButton } from 'ui-core/popover'
import classes from './DefaultButton.module.scss'

export const DefaultButton = ({
	text,
	iconLeft,
	iconRight,
	note,
	onClick,
	disabled,
	accent,
}: {
	text: string
	iconLeft: IconProp
	iconRight?: IconProp
	note?: string
	onClick: () => void
	disabled?: boolean
	accent?: boolean
}) => {
	return (
		<MenuItemButton
			onClick={onClick}
			disabled={disabled}
			className={accent ? classes.accent : undefined}
		>
			<div>
				<FontAwesomeIcon icon={iconLeft} />
			</div>
			<div>
				<h3>{text}</h3>
				{note && <div>{note}</div>}
			</div>
			{iconRight && (
				<div>
					<div>
						<h4>
							<FontAwesomeIcon icon={iconRight} transform="shrink-1" />
						</h4>
					</div>
				</div>
			)}
		</MenuItemButton>
	)
}
