// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils'
import { useEffect, useRef, useState } from 'react'
import type { TimeLeftRaw, TimeleftDuration } from 'types'
import { getDuration } from 'utils'
import type { TimeLeftAll, UseTimeleftProps } from './types'

export const useTimeLeft = (props?: UseTimeleftProps) => {
	const depsTimeleft = props?.depsTimeleft || []
	const depsFormat = props?.depsFormat || []

	// check whether timeleft is within a minute of finishing.
	const inLastHour = () => {
		const { days, hours } = getDuration(toRef.current)
		return !days && !hours
	}

	// get the amount of seconds left if timeleft is in the last minute.
	const lastMinuteCountdown = () => {
		const { seconds } = getDuration(toRef.current)
		if (!inLastHour()) {
			return 60
		}
		return seconds
	}

	// calculate resulting timeleft object from latest duration.
	const getTimeleft = (c?: TimeleftDuration): TimeLeftAll => {
		const { days, hours, minutes, seconds } = c || getDuration(toRef.current)
		const raw: TimeLeftRaw = {
			days,
			hours,
			minutes,
		}
		if (!days && !hours) {
			raw.seconds = seconds
		}
		return {
			raw,
		}
	}

	// the end time as a date.
	const [to, setTo] = useState<Date | null>(null)
	const toRef = useRef(to)

	// resulting timeleft object to be returned.
	const [timeleft, setTimeleft] = useState<TimeLeftAll>(getTimeleft())

	// timeleft refresh intervals.
	const [minInterval, setMinInterval] = useState<
		ReturnType<typeof setInterval> | undefined
	>(undefined)
	const minIntervalRef = useRef(minInterval)

	const [secInterval, setSecInterval] = useState<
		ReturnType<typeof setInterval> | undefined
	>(undefined)
	const secIntervalRef = useRef(secInterval)

	// refresh effects.
	useEffect(() => {
		setTimeleft(getTimeleft())
		if (inLastHour()) {
			// refresh timeleft every second.
			if (!secIntervalRef.current) {
				const interval = setInterval(() => {
					if (!inLastHour()) {
						clearInterval(secIntervalRef.current)
						setStateWithRef(undefined, setSecInterval, secIntervalRef)
					}
					setTimeleft(getTimeleft())
				}, 1000)

				setStateWithRef(interval, setSecInterval, secIntervalRef)
			}
		}
		// refresh timeleft every minute.
		else if (!minIntervalRef.current) {
			const interval = setInterval(() => {
				if (inLastHour()) {
					clearInterval(minIntervalRef.current)
					setStateWithRef(undefined, setMinInterval, minIntervalRef)
				}
				setTimeleft(getTimeleft())
			}, 60000)
			setStateWithRef(interval, setMinInterval, minIntervalRef)
		}
	}, [to, inLastHour(), lastMinuteCountdown(), ...depsTimeleft])

	// re-render the timeleft upon formatting changes.
	useEffect(() => {
		setTimeleft(getTimeleft())
	}, [...depsFormat])

	// clear intervals on unmount
	useEffect(
		() => () => {
			clearInterval(minInterval)
			clearInterval(secInterval)
		},
		[],
	)

	// Set the end time and calculate timeleft.
	const setFromNow = (dateFrom: Date, dateTo: Date) => {
		setTimeleft(getTimeleft(getDuration(dateFrom)))
		setStateWithRef(dateTo, setTo, toRef)
	}

	return {
		setFromNow,
		timeleft,
	}
}
