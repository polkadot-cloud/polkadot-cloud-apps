// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { StyledSlider } from 'library/StyledSlider'
import { SliderWrapper } from 'modals/ManagePool/Wrappers'
import { useTranslation } from 'react-i18next'
import { AccountInput } from 'ui-app/AccountInput'
import { perbillToPercent } from 'utils'
import { usePoolCommission } from './provider'

export const CommissionCurrent = () => {
	const { t } = useTranslation()
	const {
		initial,
		current,
		enabled,
		updated,
		setPayee,
		setCommission,
		setMaxCommission,
	} = usePoolCommission()
	const { globalMaxCommission } = useApi().poolsConfig

	// Get the current commission, payee and max commission values.
	const { commission, payee, maxCommission } = current
	const globalMaxCommissionUnit =
		perbillToPercent(globalMaxCommission).toNumber()

	// Warnings are surfaced above the form, so only show neutral update state here.
	const commissionFeedback = updated.commission
		? {
				text: t('updated', { ns: 'modals' }),
				label: 'neutral',
			}
		: undefined

	return (
		<>
			<SliderWrapper>
				<div>
					<h2>{commission}% </h2>
					<h5 className={commissionFeedback?.label || 'neutral'}>
						{!!commissionFeedback && commissionFeedback.text} /{' '}
						{globalMaxCommissionUnit}% {t('max', { ns: 'app' })}
					</h5>
				</div>

				<StyledSlider
					max={globalMaxCommissionUnit}
					value={commission}
					step={0.05}
					onChange={(val) => {
						if (typeof val === 'number') {
							val = Number(val.toFixed(2))

							setCommission(val)
							if (val > maxCommission && enabled.maxCommission) {
								setMaxCommission(Math.min(initial.maxCommission, val))
							}
						}
					}}
				/>
			</SliderWrapper>

			<AccountInput
				defaultLabel={t('inputPayeeAccount', { ns: 'modals' })}
				successLabel={t('payeeAdded', { ns: 'modals' })}
				locked={payee !== null}
				successCallback={async (input) => {
					setPayee(input)
				}}
				resetCallback={() => {
					setPayee(null)
				}}
				disallowAlreadyImported={false}
				initialValue={payee}
				inactive={commission === 0}
				border={payee === null}
			/>
		</>
	)
}
