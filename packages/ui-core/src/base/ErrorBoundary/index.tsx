// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBug } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export type ErrorBoundaryFallbackVariant = 'app' | 'routes' | 'modal'

export interface ErrorBoundaryFallbackProps {
	action: ReactNode
	onReset?: () => void
	title: ReactNode
	variant?: ErrorBoundaryFallbackVariant
}

export const ErrorBoundaryFallback = ({
	action,
	onReset,
	title,
	variant = 'routes',
}: ErrorBoundaryFallbackProps) => {
	const wrapperClasses = classNames(classes.wrapper, {
		[classes.app]: variant === 'app',
		[classes.modal]: variant === 'modal',
	})

	if (variant === 'modal') {
		return (
			<div className={wrapperClasses}>
				<h2>{title}</h2>
				<h4>
					<button type="button" onClick={onReset}>
						{action}
					</button>
				</h4>
			</div>
		)
	}

	return (
		<div className={wrapperClasses}>
			<h3 className={variant === 'routes' ? classes.withMargin : undefined}>
				<FontAwesomeIcon icon={faBug} transform="grow-25" />
			</h3>
			<h1>{title}</h1>
			<h2>
				<button type="button" onClick={onReset}>
					{action}
				</button>
			</h2>
		</div>
	)
}
