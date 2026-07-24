// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAutoFitText } from '@w3ux/hooks'
import classNames from 'classnames'
import type { RefObject } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'

/**
 * @name Title
 * @summary Used to house a title for `Stat.Card`
 */
export const Title = ({
	children,
	style,
	primary,
	text,
	semibold,
}: ComponentBase & {
	primary?: boolean
	text?: boolean
	semibold?: boolean
}) => {
	const allClasses = classNames(classes.title, {
		[classes.semibold]: !!semibold,
		[classes.primary]: !!primary,
		[classes.text]: !!text,
	})

	const { containerRef, fontSize } = useAutoFitText({
		minFontSize: 0.85,
		maxFontSize: 1.35,
		unit: 'rem',
	})

	return (
		<h3
			className={allClasses}
			style={{ ...style, fontSize }}
			ref={containerRef as RefObject<HTMLHeadingElement | null>}
		>
			{children}
		</h3>
	)
}
