// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ToastDelayDuration } from 'consts'
import type { NotificationText } from 'types'
import { _notifications } from './private'

let notificationCounter = 0

export const notifications$ = _notifications.asObservable()

export const emitNotification = ({ title, subtitle }: NotificationText) => {
	// Create a new notification with an index based on the current length of the notifications array
	const index = notificationCounter++

	// Add the new notification to global bus state
	_notifications.next([
		..._notifications.getValue(),
		{
			index,
			title,
			subtitle,
		},
	])

	// After a period of time, dismiss the notification
	setTimeout(() => {
		_notifications.next(
			_notifications
				.getValue()
				.filter((notification) => notification.index !== index),
		)
	}, ToastDelayDuration)
}
