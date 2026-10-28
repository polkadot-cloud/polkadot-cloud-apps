// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import classes from './index.module.scss'
import type { SendFormFieldProps } from './types'

export const Field = ({
	title,
	children,
	className,
	headerContent,
	responsiveHeader = false,
}: SendFormFieldProps) => (
	<div className={className}>
		<div
			className={classNames(classes.titleRow, {
				[classes.responsiveTitleRow]: responsiveHeader,
			})}
		>
			<span className={classes.title}>{title}</span>
			{headerContent}
		</div>
		{children}
	</div>
)
