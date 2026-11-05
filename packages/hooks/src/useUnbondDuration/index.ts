// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { getUnixTime } from 'date-fns'
import type { BondFor } from 'types'
import { timeleftAsString } from 'utils'
import { useApi } from '../useApi'
import { useErasToTimeLeft } from '../useErasToTimeLeft'
import { useNetwork } from '../useNetwork'
import { useValidators } from '../useValidators'

type TranslationFn = Parameters<typeof timeleftAsString>[0]

// Validators use the full bond duration; nominators and pools use the effective nominator unbond
// duration from the active network.
export const useUnbondDuration = (bondFor: BondFor) => {
	const { getConsts } = useApi()
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { isValidator } = useValidators()
	const { erasToSeconds } = useErasToTimeLeft()
	const { bondDuration, unbondDuration: nominatorUnbondDuration } =
		getConsts(network)
	const unbondDuration =
		bondFor === 'nominator' && isValidator(activeAddress)
			? bondDuration
			: nominatorUnbondDuration

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
