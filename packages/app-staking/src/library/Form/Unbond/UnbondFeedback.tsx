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
import type { UnbondFeedbackProps } from '../types'
import { Warning } from '../Warning'
import { Spacer } from '../Wrappers'
import { UnbondInput } from './UnbondInput'

export const UnbondFeedback = ({
	bondFor,
	inSetup = false,
	setters = [],
	listenIsValid,
	defaultBond,
	setLocalResize,
	parentErrors = [],
	txFees,
	displayFirstWarningOnly = true,
}: UnbondFeedbackProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { isDepositor } = useActivePool()
	const { activeAddress } = useActiveAccount()
	const {
		poolsConfig: { minJoinBond, minCreateBond },
	} = useApi()
	const { minNominatorBond } = useStakingMetrics()
	const { balances } = useAccountBalances(activeAddress)

	const { unit, units } = getStakingChainData(network)
	const defaultValue = defaultBond ? String(defaultBond) : ''

	// get bond options for either nominating or pooling.
	const transferOptions =
		bondFor === 'pool' ? balances.pool : balances.nominator
	const { active } = transferOptions

	// store errors
	const [errors, setErrors] = useState<string[]>([])

	// local bond state
	const [bond, setBond] = useState<{ bond: string }>({
		bond: defaultValue,
	})

	// handler to set bond as a string
	const handleSetBond = ({ value }: { value: BigNumber }) => {
		setBond({ bond: value.toString() })
	}

	// current bond value BigNumber
	const bondBn = new BigNumber(unitToPlanck(String(bond.bond), units))

	// add this component's setBond to setters
	setters.push(handleSetBond)

	// bond amount to minimum threshold
	const minBondBn =
		bondFor === 'pool'
			? inSetup || isDepositor()
				? minCreateBond
				: minJoinBond
			: BigInt(minNominatorBond.toString())

	const minBondUnit = planckToUnit(minBondBn, units)

	// unbond amount to minimum threshold
	const unbondToMin =
		bondFor === 'pool'
			? inSetup || isDepositor()
				? maxBigInt(active - minCreateBond, 0n)
				: maxBigInt(active - minJoinBond, 0n)
			: maxBigInt(active - minNominatorBond, 0n)

	// check if bonded is below the minimum required
	const nominatorActiveBelowMin =
		bondFor === 'nominator' && active > 0n && active < minNominatorBond
	const poolToMin = isDepositor() ? minCreateBond : minJoinBond
	const poolActiveBelowMin = bondFor === 'pool' && active < poolToMin

	// handle error updates
	const handleErrors = () => {
		const newErrors = parentErrors
		const decimals = bond.bond.toString().split('.')[1]?.length ?? 0

		if (bondBn.isGreaterThan(active)) {
			newErrors.push(t('unbondAmount'))
		}

		if (bond.bond !== '' && bondBn.isLessThan(1)) {
			newErrors.push(t('valueTooSmall'))
		}

		if (decimals > units) {
			newErrors.push(`${t('bondAmountDecimals', { units })}`)
		}

		if (bondBn.isGreaterThan(unbondToMin)) {
			// start the error message stating a min bond is required.
			let err = `${t('minimumBond', {
				minBondUnit: minBondUnit.toString(),
				unit,
			})} `
			// append the subject to the error message.
			if (bondFor === 'nominator') {
				err += t('whenActivelyNominating')
			} else if (isDepositor()) {
				err += t('asThePoolDepositor')
			} else {
				err += t('asAPoolMember')
			}
			newErrors.push(err)
		}

		if (listenIsValid && typeof listenIsValid === 'function') {
			listenIsValid(!newErrors.length && bond.bond !== '', newErrors)
		}
		setErrors(newErrors)
	}

	// If `displayFirstWarningOnly` is set, filter errors to only the first one.
	const filteredErrors =
		displayFirstWarningOnly && errors.length > 1 ? [errors[0]] : errors

	// update bond on account change
	useEffect(() => {
		setBond({ bond: defaultValue })
	}, [activeAddress])

	// handle errors on input change
	useEffect(() => {
		handleErrors()
	}, [bond, txFees])

	// if resize is present, handle on error change
	useEffect(() => {
		if (setLocalResize) {
			setLocalResize()
		}
	}, [errors])

	return (
		<>
			{filteredErrors.map((err) => (
				<Warning key={`unbond_error_${err}`} text={err} />
			))}
			<Spacer />
			<UnbondInput
				active={new BigNumber(active)}
				defaultValue={defaultValue}
				disabled={
					active === 0n || nominatorActiveBelowMin || poolActiveBelowMin
				}
				unbondToMin={new BigNumber(unbondToMin)}
				setters={setters}
				value={bond.bond}
			/>
		</>
	)
}
