// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { notifications$ } from 'global-bus'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { NotificationItem } from 'types'
import { Wrapper } from './Wrapper'

export const NotificationPrompts = () => {
	// Store the notifications currently in state
	const [notifications, setNotifications] = useState<NotificationItem[]>([])

	// Listen to global bus notifications
	useEffect(() => {
		const subNotifications = notifications$.subscribe((result) => {
			setNotifications(result)
		})
		return () => {
			subNotifications.unsubscribe()
		}
	}, [])

	return (
		<Wrapper>
			<AnimatePresence initial={false}>
				{notifications.length > 0 &&
					notifications.map((notification: NotificationItem) => {
						const { title, subtitle } = notification

						return (
							<motion.li
								key={`notification_${notification.index}`}
								layout
								initial={{ opacity: 0, y: -50, scale: 0.75 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{
									opacity: 0,
									scale: 0.75,
									y: -50,
									transition: { duration: 0.2 },
								}}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								{title && <h3>{title}</h3>}
								{subtitle && <p>{subtitle}</p>}
							</motion.li>
						)
					})}
			</AnimatePresence>
		</Wrapper>
	)
}
