// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classes from './index.module.scss'

export type SendFormHeaderProps = {
	title: string
	subtitle: string
	label?: string
}

export const Header = ({ title, subtitle, label }: SendFormHeaderProps) => (
	<header className={classes.header}>
		<h1 className={classes.title}>
			{title}
			{label && <span className={classes.label}>{label}</span>}
		</h1>
		<p className={classes.subtitle}>{subtitle}</p>
	</header>
)
