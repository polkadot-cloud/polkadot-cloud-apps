// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useTranslation } from 'react-i18next'
import { ButtonSubmit } from 'ui-buttons'
import { planckToUnitBn } from 'utils'
import type { ItemProps } from './types'
import { getTotalPayout } from './Utils'
import { ItemWrapper } from './Wrappers'

export const Item = ({
	era,
	validators,
	setPayouts,
	setSection,
}: ItemProps) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { unit, units } = getStakingChainData(network)
	const totalPayout = getTotalPayout(validators)
	const numPayouts = validators.length

	return (
		<ItemWrapper>
			<div>
				<section>
					<h4>
						<span>
							Era {era}:{' '}
							{t('pendingPayout', {
								count: numPayouts,
							})}
						</span>
					</h4>
					<h2>
						{planckToUnitBn(totalPayout, units).decimalPlaces(3).toFormat()}{' '}
						{unit}
					</h2>
				</section>
				<section>
					<div>
						<ButtonSubmit
							text={t('claim')}
							onClick={() => {
								setPayouts([
									{
										era,
										payout: totalPayout.toString(),
										paginatedValidators: validators.map(
											({ page, validator }) => [page || 0, validator],
										),
									},
								])
								setSection(1)
							}}
						/>
					</div>
				</section>
			</div>
		</ItemWrapper>
	)
}
