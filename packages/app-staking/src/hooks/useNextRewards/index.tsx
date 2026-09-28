// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fromUnixTime, getUnixTime } from 'date-fns'
import { useApi } from 'hooks/useApi'
import { useEraTimeLeft } from 'hooks/useEraTimeLeft'
import { useNetwork } from 'hooks/useNetwork'
import { useTimeLeft } from 'hooks/useTimeLeft'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatTimeleft, secondsFromNow } from 'utils'
import type { UseNextRewardsReturn } from './types'

export const useNextRewards = (): UseNextRewardsReturn => {
	const { t, i18n } = useTranslation('pages')
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { get: getEraTimeleft } = useEraTimeLeft()
	const { timeleft, setFromNow } = useTimeLeft({
		depsTimeleft: [network],
		depsFormat: [i18n.resolvedLanguage],
	})
	const timeleftResult = getEraTimeleft()
	const dateFrom = fromUnixTime(Date.now() / 1000)
	const formatted = formatTimeleft(t, timeleft.raw)
	const dateTo = secondsFromNow(timeleftResult.timeleft)

	// Reset timer on era change (also covers network change)
	useEffect(() => {
		setFromNow(dateFrom, dateTo)
	}, [activeEra, getUnixTime(dateTo)])

	return {
		formatted,
		timeleftResult,
		activeEra,
	}
}
