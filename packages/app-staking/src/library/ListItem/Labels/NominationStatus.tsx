// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useEraStakers } from 'contexts/EraStakers'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { ValidatorStatusWrapper } from 'library/ListItem/Wrappers'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'
import type { NominationStatusProps } from '../types'

export const NominationStatus = ({
	address,
	nominator,
	bondFor,
	noMargin = false,
	asIncoming = false,
	status,
}: NominationStatusProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const {
		getActiveValidator,
		eraStakers: { activeAccountOwnStake },
	} = useEraStakers()
	const { syncing } = useSyncing(['era-stakers'])
	const { unit, units } = getStakingChainData(network)

	let stakedAmount = new BigNumber(0)
	if (bondFor === 'nominator') {
		// bonded amount within the validator.
		stakedAmount =
			status === 'active'
				? new BigNumber(
						activeAccountOwnStake?.find((own) => own.address === address)
							?.value ?? 0,
					)
				: new BigNumber(0)
	} else {
		const staker = getActiveValidator(address)
		const exists = (staker?.others || []).find(({ who }) => who === nominator)
		if (exists) {
			stakedAmount = planckToUnitBn(new BigNumber(exists.value), units)
		}
	}

	let statusTKey
	if (status === 'active') {
		if (asIncoming) {
			statusTKey = 'activelyNominating'
		} else {
			statusTKey = 'backing'
		}
	} else if (status === 'inactive') {
		statusTKey = 'notBacking'
	} else {
		statusTKey = 'waiting'
	}

	return (
		<ValidatorStatusWrapper $status={status || 'waiting'} $noMargin={noMargin}>
			<h5>
				{t(statusTKey)}
				{stakedAmount.isGreaterThan(0)
					? ` / ${syncing ? '...' : `${stakedAmount.toFormat()} ${unit}`}`
					: null}
			</h5>
		</ValidatorStatusWrapper>
	)
}
