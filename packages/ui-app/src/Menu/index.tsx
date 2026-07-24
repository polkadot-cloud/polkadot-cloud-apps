// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOutsideAlerter } from '@w3ux/hooks'
import { useMenu } from 'hooks/useMenu'
import { isValidElement, useEffect, useRef } from 'react'
import classes from './index.module.scss'
import { MenuList } from './List'

export { MenuList }

export const Menu = () => {
	const {
		open,
		show,
		inner,
		closeMenu,
		position: [x, y],
		checkMenuPosition,
	} = useMenu()

	const menuRef = useRef<HTMLDivElement | null>(null)

	const resizeCallback = () => {
		closeMenu()
	}

	useOutsideAlerter(menuRef, () => {
		closeMenu()
	})

	useEffect(() => {
		if (open) {
			checkMenuPosition(menuRef)
		}
	}, [open])

	useEffect(() => {
		window.addEventListener('resize', resizeCallback)
		return () => {
			window.removeEventListener('resize', resizeCallback)
		}
	}, [])

	const isSecondaryBg =
		isValidElement<{ secondaryBg?: boolean }>(inner) &&
		inner.props?.secondaryBg === true

	const wrapperClassName = [
		classes.wrapper,
		isSecondaryBg ? classes.secondaryBg : undefined,
	]
		.filter(Boolean)
		.join(' ')

	return (
		open && (
			<div
				ref={menuRef}
				className={wrapperClassName}
				style={{
					position: 'absolute',
					left: `${x}px`,
					top: `${y}px`,
					zIndex: 999,
					opacity: show ? 1 : 0,
				}}
			>
				{inner}
			</div>
		)
	)
}
