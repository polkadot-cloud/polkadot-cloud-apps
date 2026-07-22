// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'

export type SendFormHeaderProps = {
	title: string
	subtitle: string
}

export const Header = ({ title, subtitle }: SendFormHeaderProps) => (
	<header className={classes.header}>
		<h1 className={classes.title}>{title}</h1>
		<p className={classes.subtitle}>{subtitle}</p>
	</header>
)
