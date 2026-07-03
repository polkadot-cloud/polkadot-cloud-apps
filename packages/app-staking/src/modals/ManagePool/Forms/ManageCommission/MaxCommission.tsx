// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { StyledSlider } from 'library/StyledSlider'
import { SliderWrapper } from 'modals/ManagePool/Wrappers'
import { useTranslation } from 'react-i18next'
import { perbillToPercent } from 'utils'
import { usePoolCommission } from './provider'

export const MaxCommission = () => {
	const { t } = useTranslation('modals')
	const { globalMaxCommission } = useApi().poolsConfig
	const { enabled, current, updated, setCommission, setMaxCommission } =
		usePoolCommission()

	// Get the current commission and max commission values.
	const { commission, maxCommission } = current
	const maxCommissionUpdated = updated.maxCommission
	const globalMaxCommissionUnit =
		perbillToPercent(globalMaxCommission).toNumber()

	const maxCommissionFeedback = maxCommissionUpdated
		? {
				text: t('updated'),
				label: 'neutral',
			}
		: undefined

	return (
		enabled.maxCommission && (
			<SliderWrapper>
				<div>
					<h2>{maxCommission}% </h2>
					<h5 className={maxCommissionFeedback?.label || 'neutral'}>
						{!!maxCommissionFeedback && maxCommissionFeedback.text}
					</h5>
				</div>

				<StyledSlider
					max={globalMaxCommissionUnit}
					value={maxCommission}
					step={0.05}
					onChange={(val) => {
						if (typeof val === 'number') {
							val = Number(val.toFixed(2))
							setMaxCommission(val)
							if (val < commission) {
								setCommission(val)
							}
						}
					}}
				/>
			</SliderWrapper>
		)
	)
}
