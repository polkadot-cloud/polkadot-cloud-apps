// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import type { FetchedPoolMember } from 'hooks/usePoolMembers'
import { BondStatus } from 'library/BondStatus'
import { useTranslation } from 'react-i18next'
import { planckToUnitBn } from 'utils'

export const PoolMemberBonded = ({ member }: { member: FetchedPoolMember }) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)

	let bonded = new BigNumber(0)
	let totalUnbonding = new BigNumber(0)

	let status = ''
	const { points, unbondingEras } = member

	bonded = planckToUnitBn(new BigNumber(points), units)
	status = bonded.isGreaterThan(0) ? 'active' : 'inactive'

	// converting unbonding eras from points to units
	let totalUnbondingUnit = new BigNumber(0)
	Object.values(unbondingEras).forEach(([, amount]) => {
		const amountBn = new BigNumber(amount)
		totalUnbondingUnit = totalUnbondingUnit.plus(amountBn)
	})
	totalUnbonding = planckToUnitBn(new BigNumber(totalUnbondingUnit), units)

	return (
		<>
			{bonded.isGreaterThan(0) && (
				<BondStatus
					status={status}
					label={t('bonded')}
					value={`${bonded.decimalPlaces(3).toFormat()} ${unit}`}
				/>
			)}
			{totalUnbonding.isGreaterThan(0) && (
				<BondStatus
					status="inactive"
					label={t('unbonding')}
					value={`${totalUnbonding.decimalPlaces(3).toFormat()} ${unit}`}
				/>
			)}
		</>
	)
}
