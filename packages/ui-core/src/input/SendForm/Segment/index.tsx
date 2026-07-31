// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export type SendFormSegmentProps = {
	title: string
	children: ReactNode
	headerContent?: ReactNode
	layer?: 'default' | 'raised' | 'top'
	responsiveHeader?: boolean
}

export const Segment = ({
	title,
	children,
	headerContent,
	layer = 'default',
	responsiveHeader = false,
}: SendFormSegmentProps) => (
	<div
		className={classNames(classes.segment, {
			[classes.raisedLayer]: layer === 'raised',
			[classes.topLayer]: layer === 'top',
		})}
	>
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
