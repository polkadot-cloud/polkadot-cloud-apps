// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faComments, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog } from 'radix-ui'
import { ButtonHeader } from 'ui-buttons'
import classes from './index.module.scss'
import type { ChatPanelProps } from './types'

// Keep the portal inside the app theme. Radix retains closing content until its
// CSS exit animation finishes, while owning focus, Escape and scroll locking.
export const ChatPanel = ({
	open,
	onOpenChange,
	portalContainer,
	triggerLabel,
	closeLabel,
	title,
	description,
	status,
	statusTone = 'neutral',
	children,
	footer,
}: ChatPanelProps) => (
	<Dialog.Root open={open} onOpenChange={onOpenChange}>
		<Dialog.Trigger aria-label={triggerLabel} className={classes.trigger}>
			<ButtonHeader icon={faComments} />
		</Dialog.Trigger>
		<Dialog.Portal container={portalContainer}>
			<Dialog.Overlay className={classes.backdrop} />
			<Dialog.Content className={classes.panel}>
				<header className={classes.header}>
					<div className={classes.headerIcon} aria-hidden="true">
						<FontAwesomeIcon icon={faComments} />
					</div>
					<div className={classes.heading}>
						<Dialog.Title className={classes.title}>{title}</Dialog.Title>
						<p className={classes.status} data-tone={statusTone} role="status">
							<span aria-hidden="true" />
							{status}
						</p>
					</div>
					<Dialog.Close aria-label={closeLabel} className={classes.close}>
						<FontAwesomeIcon icon={faXmark} />
					</Dialog.Close>
				</header>
				<Dialog.Description className={classes.description}>
					{description}
				</Dialog.Description>
				{children}
				{footer}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
)
