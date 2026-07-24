// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAutoFitText } from '@w3ux/hooks'
import { mergeRefs } from '@w3ux/utils'
import classNames from 'classnames'
import { forwardRef } from 'react'
import type { ComponentBase } from 'types'
import classes from './index.module.scss'
/**
 * @name Subtitle
 * @summary Used to house a subtitle for `StatCard`
 */
export const Subtitle = forwardRef<
	HTMLHeadingElement,
	ComponentBase & {
		primary?: boolean
	}
>(({ children, style, primary }, externalRef) => {
	const allClasses = classNames(classes.subtitle, {
		[classes.primary]: !!primary,
	})
	const { containerRef, fontSize } = useAutoFitText({
		minFontSize: 0.625,
		maxFontSize: 1.12,
		unit: 'rem',
	})

	return (
		<h4
			className={allClasses}
			style={{ ...style, fontSize }}
			ref={(el) => mergeRefs(el, containerRef, externalRef)}
		>
			{children}
		</h4>
	)
})

Subtitle.displayName = 'Subtitle'
