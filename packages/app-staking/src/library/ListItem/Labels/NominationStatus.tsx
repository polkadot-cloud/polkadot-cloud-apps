// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNominationBacking } from 'data-gate/react'
import { useNetwork } from 'hooks/useNetwork'
import { BondStatus } from 'library/BondStatus'
import { useTranslation } from 'react-i18next'
import { formatCompactNumber, planckToUnitBn } from 'utils'
import type { NominationStatusProps } from '../types'

type NominationStatusDataProps = Pick<
	NominationStatusProps,
	| 'address'
	| 'asIncoming'
	| 'bondFor'
	| 'nominator'
	| 'status'
	| 'statusLoading'
>

export const useNominationStatusData = ({
	address,
	nominator,
	asIncoming = false,
	status,
	statusLoading = false,
}: NominationStatusDataProps) => {
	const { t, i18n } = useTranslation('app')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const backing = useNominationBacking(
		nominator,
		address,
		status === 'active' && !asIncoming,
	)
	const syncing = statusLoading || backing.loading
	const stakedAmount = planckToUnitBn(new BigNumber(backing.data ?? 0n), units)
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
		label: statusLoading
			? t('syncing')
			: status === undefined
				? '—'
				: t(statusTKey),
		stakedAmount,
		syncing,
		unit,
		value: stakedAmount.isGreaterThan(0)
			? syncing
				? '...'
				: `${formatCompactNumber(stakedAmount.toNumber(), i18n.resolvedLanguage)} ${unit}`
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
	statusLoading,
}: NominationStatusProps) => {
	const { label, value } = useNominationStatusData({
		address,
		asIncoming,
		bondFor,
		nominator,
		status,
		statusLoading,
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
