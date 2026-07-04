// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { JSX } from 'react'
import type { ButtonTabPreloaderProps } from '../types'
import classes from './index.module.scss'

export const ButtonTabPreloader = ({
	className,
	colorSecondary,
	style,
	width,
}: ButtonTabPreloaderProps): JSX.Element => (
	<div
		aria-hidden="true"
		className={classNames(
			classes.btnTabPreloader,
			{ [classes.secondary]: colorSecondary },
			className,
		)}
		style={{
			...style,
			width,
		}}
	>
		<span className={classes.shadowLabel} />
	</div>
)
