// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const Header = ({
	Logo,
	title,
	offsetChildren,
	websiteText,
	websiteUrl,
	children,
	marginY,
}: {
	Logo: ReactNode
	title: string
	websiteText: string
	websiteUrl: string
	offsetChildren?: boolean
	marginY?: boolean
	children: ReactNode
}) => {
	const headerClasses = classNames(classes.header, {
		[classes.marginY]: marginY,
	})

	const offsetClass = offsetChildren ? classes.offset : undefined

	return (
		<div className={headerClasses}>
			<div>{Logo}</div>
			<div>
				<h3>{title}</h3>
				<h4>
					<a href={websiteUrl} target="_blank" rel="noopener noreferrer">
						{websiteText}
					</a>
				</h4>
			</div>
			<div className={offsetClass}>{children}</div>
		</div>
	)
}
