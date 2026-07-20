// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'ui-core/base'
import type { ButtonCopyProps } from '../types'
import classes from './index.module.scss'

export const ButtonCopy = ({
	onClick,
	value,
	size,
	portalContainer,
	xMargin,
	tooltipText,
	children,
	style,
}: ButtonCopyProps) => {
	const [active, setActive] = useState<boolean>(false)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const handleClick = () => {
		setActive(true)
	}

	const baseClasses = classNames(classes.btnCopy, {
		[classes.xMargin]: xMargin,
		[classes.withChildren]: children !== undefined,
	})

	const copyClasses = classNames(classes.copy, {
		[classes.active]: active,
		[classes.inherit]: size === undefined,
	})

	const checkClasses = classNames(classes.check, {
		[classes.active]: active,
		[classes.inherit]: size === undefined,
	})

	const text = active ? tooltipText.copied : tooltipText.copy

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen && buttonRef.current) {
			buttonRef.current.blur()
		}
	}

	// Unfocus trigger when tooltip closes
	useEffect(() => {
		if (!open && buttonRef.current) {
			buttonRef.current.blur()
		}
	}, [open])

	return (
		<Tooltip
			text={text}
			container={portalContainer}
			handleOpenChange={handleOpenChange}
		>
			<button
				style={
					!children ? { ...style, width: size, height: size } : { ...style }
				}
				type="button"
				ref={buttonRef}
				className={baseClasses}
				onClick={() => {
					if (typeof onClick === 'function') {
						onClick()
					}
					navigator.clipboard.writeText(value)
					handleClick()
				}}
			>
				{children}
				<span
					style={size ? { width: size } : {}}
					className={copyClasses}
					onAnimationEnd={() => {
						setActive(false)
					}}
				>
					<FontAwesomeIcon icon={faCopy} className={classes.icon} />
				</span>
				<span style={size ? { width: size } : {}} className={checkClasses}>
					<FontAwesomeIcon icon={faCheck} className={classes.icon} />
				</span>
			</button>
		</Tooltip>
	)
}
