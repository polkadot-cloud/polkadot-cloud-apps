// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import type { ActionItemProps } from '../types'
import classes from './index.module.scss'

/**
 * @name ActionItem
 * @summary A call to action item as a header.
 * @param {string} text - The text to display.
 */
export const ActionItem = ({
	style,
	text,
	toggled,
	disabled,
	onToggle,
	inactive = false,
	inlineButton,
}: ActionItemProps) => {
	const [toggle, setToggle] = useState<boolean | undefined>(toggled)

	useEffect(() => setToggle(toggled), [toggled])

	return (
		<h3
			className={classes.actionItem}
			style={{
				...style,
				opacity: inactive ? 0.3 : 1,
			}}
		>
			{toggled === undefined ? (
				<FontAwesomeIcon icon={faChevronRight} transform="shrink-6" />
			) : (
				<button
					type="button"
					className={classes.toggle}
					disabled={disabled}
					onClick={() => {
						if (typeof onToggle === 'function') {
							onToggle(!toggle)
						}
						setToggle(!toggle)
					}}
				>
					{toggle && <FontAwesomeIcon icon={faCheck} transform="shrink-3" />}
				</button>
			)}
			{text}
			{inlineButton && <span>{inlineButton}</span>}
		</h3>
	)
}
