// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { QuickActionFooterButtonProps } from '../types'
import classes from './index.module.scss'

export const FooterButton = ({
	icon,
	label,
	onClick,
}: QuickActionFooterButtonProps) => (
	<button type="button" className={classes.footerButton} onClick={onClick}>
		<FontAwesomeIcon icon={icon} />
		{label}
	</button>
)
