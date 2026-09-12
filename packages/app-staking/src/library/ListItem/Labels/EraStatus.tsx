// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { capitalizeFirstLetter } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { BondStatus } from 'library/BondStatus'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'
import type { EraStatusProps } from '../types'

export const EraStatus = ({
	overview,
	unavailable = false,
	noMargin,
	status,
}: EraStatusProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const syncing = !unavailable && overview === undefined
	const { unit, units } = getStakingChainData(network)

	// Fallback to `waiting` status if still syncing.
	const validatorStatus = syncing ? 'waiting' : status

	return (
		<BondStatus
			status={validatorStatus}
			noMargin={noMargin}
			label={
				unavailable
					? '—'
					: syncing
						? t('syncing')
						: validatorStatus === 'waiting'
							? capitalizeFirstLetter(t(validatorStatus) ?? '')
							: t('listItemActive')
			}
			value={
				!unavailable && !syncing && validatorStatus !== 'waiting'
					? `${planckToUnitBn(new BigNumber(overview?.total ?? 0n), units)
							.integerValue()
							.toFormat()} ${unit}`
					: undefined
			}
		/>
	)
}
