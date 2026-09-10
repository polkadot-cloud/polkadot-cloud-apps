// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
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
	unavailable?: boolean
}

export const useNominationStatusData = ({
	asIncoming = false,
	status,
	activeBacking,
	isPreloading = false,
	unavailable = false,
}: NominationStatusDataProps) => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	// Lists supply backing from their selected source; rendering a label never starts a data fetch.
	const syncing = !asIncoming && isPreloading
	const totalActiveBacking = planckToUnitBn(
		new BigNumber(activeBacking ?? '0'),
		units,
	)

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
		label: unavailable ? '—' : syncing ? `${t('syncing')}...` : t(statusTKey),
		totalActiveBacking,
		syncing,
		unit,
		value:
			!unavailable && totalActiveBacking.isGreaterThan(0)
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
	activeBacking,
	isPreloading,
	unavailable,
}: NominationStatusProps &
	Pick<
		NominationStatusDataProps,
		'activeBacking' | 'isPreloading' | 'unavailable'
	>) => {
	const { label, value } = useNominationStatusData({
		address,
		asIncoming,
		bondFor,
		nominator,
		status,
		activeBacking,
		isPreloading,
		unavailable,
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
