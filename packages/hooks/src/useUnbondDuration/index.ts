// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getUnixTime } from 'date-fns'
import { timeleftAsString } from 'utils'
import { useApi } from '../useApi'
import { useErasToTimeLeft } from '../useErasToTimeLeft'
import { useNetwork } from '../useNetwork'

type TranslationFn = Parameters<typeof timeleftAsString>[0]

// Provides the effective unbonding duration for the active network in eras,
// along with a formatter for displaying it as a timeleft string
export const useUnbondDuration = () => {
	const { getConsts } = useApi()
	const { network } = useNetwork()
	const { erasToSeconds } = useErasToTimeLeft()
	const { unbondDuration } = getConsts(network)

	const formatUnbondDuration = (t: TranslationFn) =>
		timeleftAsString(
			t,
			getUnixTime(new Date()) + 1,
			erasToSeconds(unbondDuration),
			true,
		)

	return {
		unbondDuration,
		formatUnbondDuration,
	}
}
