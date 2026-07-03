// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

export type EntryProps = ComponentBase & {
	mode: 'light' | 'dark'
	theme: string
	language: string
}

/**
 * @name Entry
 * @summary The outer-most wrapper that hosts core tag styling.
 */
export const Entry = forwardRef(
	(
		{ children, style, mode, theme, language }: EntryProps,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const langClass = `${language.toLowerCase()}Lang`

		return (
			<div
				ref={ref}
				className={`${classes.entry} ${mode} ${theme} ${langClass}`}
				style={style}
			>
				{children}
			</div>
		)
	},
)
