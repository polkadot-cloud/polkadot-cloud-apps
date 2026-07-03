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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BalanceInput } from '../BalanceInput'
import type { BondFeedbackProps } from '../types'
import { Warning } from '../Warning'

export const BondFeedback = ({
	bondFor,
	bonding = false,
	joiningPool = false,
	parentErrors = [],
	setters = [],
	listenIsValid,
	disableTxFeeUpdate = false,
	defaultBond,
	txFees,
	maxWidth,
	syncing = false,
	displayFirstWarningOnly = true,
}: BondFeedbackProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { isDepositor } = useActivePool()
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

	const defaultBondStr = defaultBond ? String(defaultBond) : ''

	// get bond options for either staking or pooling.
	const availableBalance =
		bondFor === 'nominator' ? totalAdditionalBond : transferableBalance

	// the default bond balance. If we are bonding, subtract tx fees from bond amount.
	const freeToBond = !disableTxFeeUpdate
		? maxBigInt(availableBalance - txFees, 0n)
		: availableBalance

	// store errors
	const [errors, setErrors] = useState<string[]>([])

	// local bond state
	const [bond, setBond] = useState<{ bond: string }>({
		bond: defaultBondStr,
	})

	// handler to set bond as a string
	const handleSetBond = ({ value }: { value: BigNumber }) => {
		setBond({ bond: value.toString() })
	}

	// current bond planck value
	const bondBigInt = unitToPlanck(bond.bond, units)

	// whether bond is disabled
	const [bondDisabled, setBondDisabled] = useState<boolean>(false)

	// bond minus tx fees if too much
	const enoughToCoverTxFees = freeToBond - bondBigInt > txFees

	const bondAfterTxFees = enoughToCoverTxFees
		? bondBigInt
		: maxBigInt(bondBigInt - txFees, 0n)

	// add this component's setBond to setters
	setters.push(handleSetBond)

	// bond amount to minimum threshold.
	const minBond =
		bondFor === 'pool'
			? isDepositor()
				? minCreateBond
				: minJoinBond
			: minNominatorBond

	const minBondUnit = new BigNumber(planckToUnit(minBond, units))

	// handle error updates
	const handleErrors = () => {
		let disabled = false
		const newErrors = parentErrors
		const decimals = bond.bond.toString().split('.')[1]?.length ?? 0

		// bond errors
		if (freeToBond === 0n) {
			disabled = true
			newErrors.push(`${t('noFree', { unit })}`)
		}

		if (!bonding || joiningPool) {
			if (freeToBond < minBond) {
				disabled = true
				newErrors.push(`${t('notMeet')} ${minBondUnit} ${unit}.`)
			}
			// bond amount must be more than minimum required bond
			if (bond.bond !== '' && bondBigInt < minBond) {
				newErrors.push(`${t('atLeast')} ${minBondUnit} ${unit}.`)
			}
		}

		// bond amount must not be smaller than 1 planck
		if (bond.bond !== '' && bondBigInt < 1) {
			newErrors.push(t('tooSmall'))
		}

		// bond amount must not surpass freeBalance
		if (bondBigInt > freeToBond) {
			newErrors.push(t('moreThanBalance'))
		}

		// check bond after transaction fees is still valid
		if (bond.bond !== '' && bondAfterTxFees < 0n) {
			newErrors.push(`${t('notEnoughAfter', { unit })}`)
		}

		// bond amount must not surpass network supported units
		if (decimals > units) {
			newErrors.push(`${t('bondDecimalsError', { units })}`)
		}

		const bondValid = !newErrors.length && bond.bond !== ''
		setBondDisabled(disabled)

		if (listenIsValid && typeof listenIsValid === 'function') {
			listenIsValid(bondValid, newErrors)
		}

		setErrors(newErrors)
	}

	// If `displayFirstWarningOnly` is set, filter errors to only the first one.
	const filteredErrors =
		displayFirstWarningOnly && errors.length > 1 ? [errors[0]] : errors

	// update bond on account change
	useEffect(() => {
		setBond({
			bond: defaultBondStr,
		})
	}, [activeAddress])

	// handle errors on input change
	useEffect(() => {
		handleErrors()
	}, [bond, txFees])

	// update max bond after txFee sync
	useEffect(() => {
		if (!disableTxFeeUpdate) {
			if (bondBigInt > freeToBond) {
				setBond({ bond: planckToUnit(freeToBond, units) })
			}
		}
	}, [txFees])

	return (
		<>
			{filteredErrors.map((err) => (
				<Warning key={`setup_error_${err}`} text={err} />
			))}
			<div
				style={{
					width: '100%',
					maxWidth: maxWidth ? '500px' : '100%',
				}}
			>
				<BalanceInput
					value={String(bond.bond)}
					defaultValue={defaultBondStr}
					syncing={syncing}
					disabled={bondDisabled}
					setters={setters}
					maxAvailable={new BigNumber(planckToUnit(freeToBond, units))}
					disableTxFeeUpdate={disableTxFeeUpdate}
				/>
			</div>
		</>
	)
}
