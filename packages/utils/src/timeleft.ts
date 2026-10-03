// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { differenceInDays, getUnixTime, intervalToDuration } from 'date-fns'
import type { TimeleftDuration } from 'types'

const defaultDuration: TimeleftDuration = {
	days: 0,
	hours: 0,
	minutes: 0,
	seconds: 0,
	lastMinute: false,
}

// calculates the current timeleft duration.
export const getDuration = (toDate: Date | null): TimeleftDuration => {
	if (!toDate) {
		return defaultDuration
	}
	if (getUnixTime(toDate) <= getUnixTime(new Date())) {
		return defaultDuration
	}

	toDate.setSeconds(toDate.getSeconds())
	const d = intervalToDuration({
		start: Date.now(),
		end: toDate,
	})

	const days = differenceInDays(toDate, Date.now())
	const hours = d?.hours || 0
	const minutes = d?.minutes || 0
	const seconds = d?.seconds || 0
	const lastHour = days === 0 && hours === 0
	const lastMinute = lastHour && minutes === 0

	return {
		days,
		hours,
		minutes,
		seconds,
		lastMinute,
	}
}

// Helper: Adds `seconds` to the current time and returns the resulting date.
export const secondsFromNow = (seconds: number): Date => {
	const end = new Date()
	end.setSeconds(end.getSeconds() + seconds)
	return end
}

// Helper: Calculates the duration between the current time and the provided date.
export const getDurationFromNow = (toDate: Date | null): TimeleftDuration => {
	if (!toDate) {
		return defaultDuration
	}
	if (getUnixTime(toDate) <= getUnixTime(new Date())) {
		return defaultDuration
	}

	toDate.setSeconds(toDate.getSeconds())
	const d = intervalToDuration({
		start: Date.now(),
		end: toDate,
	})

	const days = differenceInDays(toDate, Date.now())
	const hours = d?.hours || 0
	const minutes = d?.minutes || 0
	const seconds = d?.seconds || 0
	const lastHour = days === 0 && hours === 0
	const lastMinute = lastHour && minutes === 0

	return {
		days,
		hours,
		minutes,
		seconds,
		lastMinute,
	}
}
