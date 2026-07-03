// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faFlag } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import type { NominateStatusBarProps } from '../types'
import { Wrapper } from './Wrapper'

export const CreatePoolStatusBar = ({ value }: NominateStatusBarProps) => {
	const { t } = useTranslation('app')
	const { minCreateBond } = useApi().poolsConfig
	const { network } = useNetwork()
	const { syncing } = useSyncing(['initialization'])
	const { unit, units } = getStakingChainData(network)

	const minCreateBondUnit = new BigNumber(planckToUnit(minCreateBond, units))
	const sectionClassName =
		value.isGreaterThanOrEqualTo(minCreateBondUnit) && !syncing ? 'invert' : ''

	return (
		<Wrapper>
			<div className="bars">
				<section className={sectionClassName}>
					<h4>&nbsp;</h4>
					<div className="bar">
						<h5>0 {unit}</h5>
					</div>
				</section>
				<section className={sectionClassName}>
					<h4>
						<FontAwesomeIcon icon={faFlag} transform="shrink-4" />
						&nbsp;{t('createPool')}
					</h4>
					<div className="bar">
						<h5>
							{syncing
								? '...'
								: `${minCreateBondUnit.decimalPlaces(3).toFormat()} ${unit}`}
						</h5>
					</div>
				</section>
			</div>
		</Wrapper>
	)
}
