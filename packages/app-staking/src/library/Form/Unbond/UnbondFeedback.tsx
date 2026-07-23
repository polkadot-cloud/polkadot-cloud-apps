// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { maxBigInt, planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BalanceInput } from 'ui-app/BalanceInput'
import type { UnbondFeedbackProps } from '../types'
import { Warning } from '../Warning'
import { Spacer } from '../Wrappers'

export const UnbondFeedback = ({
	value,
	onChange,
	bondFor,
	listenIsValid,
	parentErrors = [],
}: UnbondFeedbackProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { isDepositor } = useActivePool()
	const poolDepositor = isDepositor()
	const { activeAddress } = useActiveAccount()
	const {
		poolsConfig: { minJoinBond, minCreateBond },
	} = useApi()
	const { minNominatorBond } = useStakingMetrics()
	const { balances } = useAccountBalances(activeAddress)

	const { unit, units } = getStakingChainData(network)
	// get bond options for either nominating or pooling.
	const transferOptions =
		bondFor === 'pool' ? balances.pool : balances.nominator
	const { active } = transferOptions

	// Current bond value in planck.
	const bondPlanck = unitToPlanck(value || '0', units)

	// bond amount to minimum threshold
	const minBond =
		bondFor === 'pool'
			? poolDepositor
				? minCreateBond
				: minJoinBond
			: minNominatorBond

	const minBondUnit = new BigNumber(planckToUnit(minBond, units)).toFormat()

	// unbond amount to minimum threshold
	const unbondToMin =
		bondFor === 'pool'
			? poolDepositor
				? maxBigInt(active - minCreateBond, 0n)
				: maxBigInt(active - minJoinBond, 0n)
			: maxBigInt(active - minNominatorBond, 0n)

	// check if bonded is below the minimum required
	const nominatorActiveBelowMin =
		bondFor === 'nominator' && active > 0n && active < minNominatorBond
	const poolToMin = poolDepositor ? minCreateBond : minJoinBond
	const poolActiveBelowMin = bondFor === 'pool' && active < poolToMin

	const errors = [...parentErrors]
	const decimals = value.split('.')[1]?.length ?? 0

	if (bondPlanck > active) {
		errors.push(t('unbondAmount'))
	}
	if (value && bondPlanck < 1n) {
		errors.push(t('valueTooSmall'))
	}
	if (decimals > units) {
		errors.push(t('bondAmountDecimals', { units }))
	}
	if (bondPlanck > unbondToMin) {
		// start the error message stating a min bond is required.
		let err = `${t('minimumBond', {
			minBondUnit,
			unit,
		})} `
		// append the subject to the error message.
		if (bondFor === 'nominator') {
			err += t('whenActivelyNominating')
		} else if (poolDepositor) {
			err += t('asThePoolDepositor')
		} else {
			err += t('asAPoolMember')
		}
		errors.push(err)
	}

	const bondValid = errors.length === 0 && value !== ''
	useEffect(() => {
		listenIsValid?.(bondValid)
	}, [bondValid, listenIsValid])

	return (
		<>
			{errors.slice(0, 1).map((err) => (
				<Warning key={`unbond_error_${err}`} text={err} />
			))}
			<Spacer />
			<BalanceInput
				value={value}
				onChange={onChange}
				disabled={
					active === 0n || nominatorActiveBelowMin || poolActiveBelowMin
				}
				maxAvailable={planckToUnit(unbondToMin, units)}
			/>
		</>
	)
}
