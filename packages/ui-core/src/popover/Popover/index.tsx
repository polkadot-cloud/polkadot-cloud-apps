// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { Popover as RadixPopover } from 'radix-ui'
import type { ReactNode } from 'react'
import classes from './index.module.scss'

export const Popover = ({
	children,
	content,
	portalContainer,
	open,
	onTriggerClick,
	width,
	side,
	align,
	transparent = false,
	arrow = true,
	sideOffset = 3,
}: {
	children: ReactNode
	content: ReactNode
	portalContainer?: HTMLDivElement
	open?: boolean
	onTriggerClick?: () => void
	width?: string | number
	side?: 'top' | 'right' | 'bottom' | 'left'
	align?: 'start' | 'center' | 'end'
	arrow?: boolean
	transparent?: boolean
	sideOffset?: number
}) => {
	width = width || '310px'

	const contentClasses = classNames(classes.content, {
		[classes.transparent]: !!transparent,
	})

	return (
		<RadixPopover.Root open={open}>
			<RadixPopover.Trigger onClick={onTriggerClick}>
				{children}
			</RadixPopover.Trigger>
			<RadixPopover.Portal container={portalContainer}>
				<RadixPopover.Content
					className={contentClasses}
					sideOffset={sideOffset}
					collisionPadding={12}
					onOpenAutoFocus={(event) => event.preventDefault()}
					style={{ width }}
					side={side}
					align={align}
				>
					<div className={classes.contentBody}>{content}</div>
					{arrow && <RadixPopover.Arrow className={classes.arrow} />}
				</RadixPopover.Content>
			</RadixPopover.Portal>
		</RadixPopover.Root>
	)
}
