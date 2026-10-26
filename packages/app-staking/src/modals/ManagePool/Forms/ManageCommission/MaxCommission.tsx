// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { SliderWrapper } from 'modals/ManagePool/Wrappers'
import { useTranslation } from 'react-i18next'
import { Slider } from 'ui-app/Slider'
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

				<Slider
					max={globalMaxCommissionUnit}
					value={maxCommission}
					step={0.05}
					ariaLabel={t('maxCommission')}
					formatValue={(value) => `${value}%`}
					onChange={(val) => {
						val = Number(val.toFixed(2))
						setMaxCommission(val)
						if (val < commission) {
							setCommission(val)
						}
					}}
				/>
			</SliderWrapper>
		)
	)
}
