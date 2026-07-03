// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useBalances } from 'hooks/useBalances'
import { useHelp } from 'hooks/useHelp'
import { useNetwork } from 'hooks/useNetwork'
import { ButtonHelpTooltip } from 'library/ButtonHelpTooltip'
import { Title } from 'library/Modal/Title'
import { StyledSlider } from 'library/StyledSlider'
import { SliderWrapper } from 'modals/ManagePool/Wrappers'
import 'rc-slider/assets/index.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimaryInvert } from 'ui-buttons'
import { CardHeader } from 'ui-core/base'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'

export const UpdateReserve = () => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { openHelpTooltip } = useHelp()
	const { closeModal } = useOverlay().modal
	const { accountHasSigner } = useImportedAccounts()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { feeReserve, setFeeReserveBalance } = useBalances()
	const { balances } = useAccountBalances(activeAddress)

	const { edReserved } = balances
	const { unit, units, defaultFeeReserve } = getStakingChainData(network)

	// Force the minimum reserve to be the max of the ED reserve and the default fee reserve
	const minReserve = BigNumber.max(
		planckToUnit(edReserved, units),
		planckToUnit(defaultFeeReserve, units),
	)
	const maxReserve = minReserve.plus(
		['polkadot', 'westend'].includes(network) ? 3 : 1,
	)

	const [sliderReserve, setSliderReserve] = useState<number>(
		planckToUnitBn(new BigNumber(feeReserve), units)
			.plus(minReserve)
			.decimalPlaces(3)
			.toNumber(),
	)

	const handleChange = (val: BigNumber) => {
		// deduct ED from reserve amount.
		val = val.decimalPlaces(3)
		const actualReserve = BigNumber.max(val.minus(minReserve), 0).toNumber()
		const actualReservePlanck = unitToPlanck(actualReserve.toString(), units)
		setSliderReserve(val.decimalPlaces(3).toNumber())
		setFeeReserveBalance(actualReservePlanck)
	}

	return (
		<Padding>
			<Title
				title={t('reserveBalance')}
				helpKey="Reserve Balance"
				paddingTop="0.5rem"
			/>
			<SliderWrapper style={{ marginTop: '1rem' }}>
				<p>{t('reserveText', { unit })}</p>
				<div>
					<StyledSlider
						className="no-padding"
						min={0}
						max={maxReserve.toNumber()}
						value={sliderReserve}
						step={0.01}
						onChange={(val) => {
							if (typeof val === 'number' && val >= minReserve.toNumber()) {
								handleChange(new BigNumber(val))
							}
						}}
					/>
				</div>
				<div className="stats">
					<CardHeader>
						<h4>
							{t('reserveForExistentialDeposit')}
							<FontAwesomeIcon
								icon={faLock}
								transform="shrink-3"
								style={{ marginLeft: '0.5rem' }}
							/>
						</h4>
						<h2>
							{minReserve.isZero() ? (
								<>
									{t('none')}
									<ButtonHelpTooltip
										definition="Reserve Balance For Existential Deposit"
										openHelp={openHelpTooltip}
										style={{ marginLeft: '0.65rem' }}
									/>
								</>
							) : (
								`${minReserve.decimalPlaces(4).toString()} ${unit}`
							)}
						</h2>
					</CardHeader>
					<CardHeader>
						<h4>{t('reserveForTxFees')}</h4>
						<h2>
							{BigNumber.max(
								new BigNumber(sliderReserve)
									.minus(minReserve)
									.decimalPlaces(4)
									.toString(),
								0,
							).toString()}
							&nbsp;
							{unit}
						</h2>
					</CardHeader>
				</div>
				<div className="done">
					<ButtonPrimaryInvert
						text={t('done')}
						onClick={() => closeModal()}
						disabled={!accountHasSigner(activeAccount)}
					/>
				</div>
			</SliderWrapper>
		</Padding>
	)
}
