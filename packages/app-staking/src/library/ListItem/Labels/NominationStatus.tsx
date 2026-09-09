// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useEraStakers } from 'contexts/EraStakers'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { BondStatus } from 'library/BondStatus'
import { useTranslation } from 'react-i18next'
import { formatCompactNumber, planckToUnitBn } from 'utils'
import type { NominationStatusProps } from '../types'

type NominationStatusDataProps = Pick<
	NominationStatusProps,
	'address' | 'asIncoming' | 'bondFor' | 'nominator' | 'status'
> & {
	activeBacking?: string
	isPreloading?: boolean
}

export const useNominationStatusData = ({
	address,
	nominator,
	bondFor,
	asIncoming = false,
	status,
	activeBacking,
	isPreloading = false,
}: NominationStatusDataProps) => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const {
		getActiveValidator,
		eraStakers: { activeAccountOwnStake },
	} = useEraStakers(activeBacking === undefined)
	const { syncing: eraStakersSyncing } = useSyncing(['era-stakers'])

	const { unit, units } = getStakingChainData(network)

	// Determine if the component should be in a syncing state based on the availability of
	// activeBacking and preloading status
	const syncing = activeBacking !== undefined ? isPreloading : eraStakersSyncing

	let totalActiveBacking = new BigNumber(0)
	if (activeBacking !== undefined) {
		totalActiveBacking = planckToUnitBn(new BigNumber(activeBacking), units)
	} else if (bondFor === 'nominator') {
		if (status === 'active') {
			const backing = getActiveValidator(address)?.others.find(
				({ who }) => who === nominator,
			)
			totalActiveBacking = backing
				? planckToUnitBn(new BigNumber(backing.value), units)
				: new BigNumber(
						activeAccountOwnStake?.find((own) => own.address === address)
							?.value ?? 0,
					)
		}
	} else {
		const staker = getActiveValidator(address)
		const exists = (staker?.others || []).find(({ who }) => who === nominator)
		if (exists) {
			totalActiveBacking = planckToUnitBn(new BigNumber(exists.value), units)
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

	return {
		label: t(statusTKey),
		totalActiveBacking,
		syncing,
		unit,
		value: totalActiveBacking.isGreaterThan(0)
			? syncing
				? '...'
				: `${formatCompactNumber(totalActiveBacking.toNumber(), i18n.resolvedLanguage)} ${unit}`
			: undefined,
	}
}

export const NominationStatus = ({
	address,
	nominator,
	bondFor,
	noMargin = false,
	asIncoming = false,
	status,
}: NominationStatusProps) => {
	const { label, value } = useNominationStatusData({
		address,
		asIncoming,
		bondFor,
		nominator,
		status,
	})

	return (
		<BondStatus
			status={status || 'waiting'}
			noMargin={noMargin}
			label={label}
			value={value}
		/>
	)
}
