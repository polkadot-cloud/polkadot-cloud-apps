// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTimeLeft } from '@w3ux/hooks'
import { secondsFromNow } from '@w3ux/hooks/util'
import { differenceInDays, fromUnixTime, getUnixTime } from 'date-fns'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatTimeleft } from 'utils'

// Calculate next halving date (March 14th every 2 years starting in 2026)
const getNextHalvingDate = () => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const baseYear = 2026

	// Calculate the next halving year based on the 2-year cycle
	let nextYear: number
	if (currentYear < baseYear) {
		nextYear = baseYear
	} else {
		// Calculate years since base year
		const yearsSinceBase = currentYear - baseYear
		// Round up to next even number (0, 2, 4, 6, etc.)
		const nextCycle = Math.ceil(yearsSinceBase / 2) * 2
		nextYear = baseYear + nextCycle
	}

	// Check if we've passed March 14 this year
	const nextHalving = new Date(nextYear, 2, 14) // March is month 2 (0-indexed)
	if (now > nextHalving) {
		nextYear += 2
		return new Date(nextYear, 2, 14)
	}

	return nextHalving
}

export const useHalving = () => {
	const { t, i18n } = useTranslation()

	const nextHalvingDate = getNextHalvingDate()
	const nextHalvingUnix = Math.floor(nextHalvingDate.getTime() / 1000)

	const { timeleft, setFromNow } = useTimeLeft({
		depsTimeleft: [],
		depsFormat: [i18n.resolvedLanguage],
	})

	const dateFrom = fromUnixTime(Date.now() / 1000)
	const dateTo = secondsFromNow(nextHalvingUnix - Math.floor(Date.now() / 1000))
	const formatted = formatTimeleft(t, timeleft.raw)

	// Calculate days until next halving
	const daysUntilHalving = differenceInDays(nextHalvingDate, new Date())

	useEffect(() => {
		setFromNow(dateFrom, dateTo)
	}, [getUnixTime(dateTo)])

	return {
		nextHalvingDate,
		nextHalvingUnix,
		timeleft: formatted,
		daysUntilHalving,
	}
}
