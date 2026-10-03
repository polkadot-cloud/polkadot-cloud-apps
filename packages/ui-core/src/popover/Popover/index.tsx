// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { Popover as RadixPopover } from 'radix-ui'
import type { CSSProperties, ReactNode } from 'react'
import classes from './index.module.scss'

export const Popover = ({
	children,
	content,
	portalContainer,
	open,
	onOpenChange,
	onTriggerClick,
	triggerLabel,
	disabled = false,
	width,
	side,
	align,
	background,
	borderColor,
	attached = false,
	transparent = false,
	shadow = true,
	arrow = true,
	sideOffset = 3,
}: {
	children: ReactNode
	content: ReactNode
	portalContainer?: HTMLDivElement
	open?: boolean
	onOpenChange?: (open: boolean) => void
	onTriggerClick?: () => void
	triggerLabel?: string
	disabled?: boolean
	width?: string | number
	side?: 'top' | 'right' | 'bottom' | 'left'
	align?: 'start' | 'center' | 'end'
	background?: CSSProperties['backgroundColor']
	borderColor?: CSSProperties['borderColor']
	attached?: boolean
	arrow?: boolean
	transparent?: boolean
	shadow?: boolean
	sideOffset?: number
}) => {
	width = width || '310px'

	const contentClasses = classNames(classes.content, {
		[classes.attached]: attached,
		[classes.noShadow]: !shadow,
		[classes.transparent]: !!transparent,
	})

	return (
		<RadixPopover.Root open={open} onOpenChange={onOpenChange}>
			<RadixPopover.Trigger
				onClick={onTriggerClick}
				disabled={disabled}
				aria-label={triggerLabel}
			>
				{children}
			</RadixPopover.Trigger>
			<RadixPopover.Portal container={portalContainer}>
				<RadixPopover.Content
					className={contentClasses}
					sideOffset={attached ? 0 : sideOffset}
					collisionPadding={12}
					onOpenAutoFocus={(event) => event.preventDefault()}
					onEscapeKeyDown={(event) => event.stopPropagation()}
					style={{ width, backgroundColor: background, borderColor }}
					side={side}
					align={align}
				>
					<div className={classes.contentBody}>{content}</div>
					{arrow && !attached && (
						<RadixPopover.Arrow
							className={classes.arrow}
							style={{ fill: background }}
						/>
					)}
				</RadixPopover.Content>
			</RadixPopover.Portal>
		</RadixPopover.Root>
	)
}
