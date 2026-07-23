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
import type { BondFeedbackProps } from '../types'
import { Warning } from '../Warning'

export const BondFeedback = ({
	value,
	onChange,
	bondFor,
	bonding = false,
	displayFor = 'default',
	parentErrors = [],
	listenIsValid,
	txFees,
	maxWidth,
	syncing = false,
}: BondFeedbackProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { isDepositor } = useActivePool()
	const poolDepositor = isDepositor()
	const { activeAddress } = useActiveAccount()
	const {
		poolsConfig: { minJoinBond, minCreateBond },
	} = useApi()
	const { minNominatorBond } = useStakingMetrics()
	const { unit, units } = getStakingChainData(network)
	const {
		balances: {
			transferableBalance,
			nominator: { totalAdditionalBond },
		},
	} = useAccountBalances(activeAddress)

	// get bond options for either staking or pooling.
	const availableBalance =
		bondFor === 'nominator' ? totalAdditionalBond : transferableBalance

	// Available balance after reserving transaction fees.
	const freeToBond = maxBigInt(availableBalance - txFees, 0n)

	// current bond planck value
	const bondBigInt = unitToPlanck(value || '0', units)

	// bond amount to minimum threshold.
	const minBond =
		bondFor === 'pool'
			? poolDepositor
				? minCreateBond
				: minJoinBond
			: minNominatorBond

	const minBondUnit = new BigNumber(planckToUnit(minBond, units)).toFormat()
	const errors = [...parentErrors]
	const decimals = value.split('.')[1]?.length ?? 0
	let bondDisabled = false

	if (freeToBond === 0n) {
		bondDisabled = true
		errors.push(t('noFree', { unit }))
	}
	if (!bonding) {
		if (freeToBond < minBond) {
			bondDisabled = true
			errors.push(`${t('notMeet')} ${minBondUnit} ${unit}.`)
		}
		if (value && bondBigInt < minBond) {
			errors.push(`${t('atLeast')} ${minBondUnit} ${unit}.`)
		}
	}
	if (value && bondBigInt < 1n) {
		errors.push(t('tooSmall'))
	}
	if (bondBigInt > freeToBond) {
		errors.push(t('moreThanBalance'))
	}
	if (decimals > units) {
		errors.push(t('bondDecimalsError', { units }))
	}

	const bondValid = errors.length === 0 && value !== ''
	useEffect(() => {
		listenIsValid?.(bondValid)
	}, [bondValid, listenIsValid])

	// update max bond after txFee sync
	useEffect(() => {
		if (bondBigInt > freeToBond) {
			onChange(planckToUnit(freeToBond, units))
		}
	}, [bondBigInt, freeToBond, onChange, units])

	return (
		<>
			{errors.slice(0, 1).map((err) => (
				<Warning key={`setup_error_${err}`} text={err} />
			))}
			<div
				style={{
					width: '100%',
					maxWidth: maxWidth ? '500px' : '100%',
				}}
			>
				<BalanceInput
					displayFor={displayFor}
					value={value}
					onChange={onChange}
					syncing={syncing}
					disabled={bondDisabled}
					maxAvailable={planckToUnit(freeToBond, units)}
				/>
			</div>
		</>
	)
}
