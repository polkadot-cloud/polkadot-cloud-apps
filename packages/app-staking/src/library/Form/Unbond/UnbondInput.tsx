// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSubmitInvert } from 'ui-buttons'
import { planckToUnitBn } from 'utils'
import type { UnbondInputProps } from '../types'
import { InputWrapper } from '../Wrappers'

export const UnbondInput = ({
	defaultValue,
	disabled,
	unbondToMin,
	setters = [],
	value = '0',
	active,
}: UnbondInputProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()

	const { unit, units } = getStakingChainData(network)
	// get the actively bonded amount
	const activeUnit = planckToUnitBn(active, units)

	// the current local bond value.
	const [localBond, setLocalBond] = useState<string>(value)

	// reset value to default when changing account.
	useEffect(() => {
		setLocalBond(defaultValue ?? '0')
	}, [activeAddress])

	// handle change for unbonding.
	const handleChangeUnbond = (e: ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		if (new BigNumber(val).isNaN() && val !== '') {
			return
		}
		setLocalBond(val)
		updateParentState(new BigNumber(val))
	}

	// apply bond to parent setters.
	const updateParentState = (value: BigNumber) => {
		if (new BigNumber(value).isNaN()) {
			return
		}
		for (const setter of setters) {
			setter({
				value,
			})
		}
	}

	// unbond to min as unit.
	const unbondToMinUnit = planckToUnitBn(unbondToMin, units)

	// available funds as jsx.
	const maxBondedJsx = (
		<p>
			{activeUnit.toFormat()} {unit} {t('bonded')}
		</p>
	)

	return (
		<InputWrapper>
			<div className="inner">
				<section style={{ opacity: disabled ? 0.5 : 1 }}>
					<div className="input">
						<div>
							<input
								type="text"
								placeholder={`0 ${unit}`}
								value={localBond}
								onChange={(e) => {
									handleChangeUnbond(e)
								}}
								disabled={disabled}
							/>
						</div>
						<div>{maxBondedJsx}</div>
					</div>
					<ButtonSubmitInvert
						text={t('max')}
						disabled={disabled}
						onClick={() => {
							setLocalBond(unbondToMinUnit.toString())
							updateParentState(unbondToMinUnit)
						}}
						marginLeft
					/>
				</section>
			</div>
			<div className="availableOuter">{maxBondedJsx}</div>
		</InputWrapper>
	)
}
