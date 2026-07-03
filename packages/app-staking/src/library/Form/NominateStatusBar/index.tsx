// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faFlag } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNetwork } from 'hooks/useNetwork'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useSyncing } from 'hooks/useSyncing'
import { useTranslation } from 'react-i18next'
import type { NominateStatusBarProps } from '../types'
import { Wrapper } from './Wrapper'

export const NominateStatusBar = ({ value }: NominateStatusBarProps) => {
	const { t } = useTranslation('app')
	const { minNominatorBond, minimumActiveStake } = useStakingMetrics()
	const { network } = useNetwork()
	const { syncing } = useSyncing(['initialization'])
	const { unit, units } = getStakingChainData(network)

	const minNominatorBondUnit = new BigNumber(
		planckToUnit(minNominatorBond, units),
	)
	const minimumActiveStakeUnit = new BigNumber(
		planckToUnit(minimumActiveStake, units),
	)
	const gtMinNominatorBond = value.isGreaterThanOrEqualTo(minNominatorBondUnit)
	const gtMinActiveStake = value.isGreaterThanOrEqualTo(minimumActiveStakeUnit)

	return (
		<Wrapper>
			<div className="bars">
				<section className={gtMinNominatorBond && !syncing ? 'invert' : ''}>
					<h4>&nbsp;</h4>
					<div className="bar">
						<h5>{t('nominateInactive')}</h5>
					</div>
				</section>
				<section className={gtMinNominatorBond && !syncing ? 'invert' : ''}>
					<h4>
						<FontAwesomeIcon icon={faFlag} transform="shrink-4" />
						&nbsp; {t('nominate')}
					</h4>
					<div className="bar">
						<h5>
							{minNominatorBondUnit.decimalPlaces(3).toFormat()} {unit}
						</h5>
					</div>
				</section>
				<section className={gtMinActiveStake && !syncing ? 'invert' : ''}>
					<h4>
						<FontAwesomeIcon icon={faFlag} transform="shrink-4" />
						&nbsp;{t('nominateActive')}
					</h4>
					<div className="bar">
						<h5>
							{syncing
								? '...'
								: `${(minimumActiveStakeUnit.isLessThan(minNominatorBondUnit)
										? minNominatorBondUnit
										: minimumActiveStakeUnit
									)
										.decimalPlaces(3)
										.toFormat()} ${unit}`}
						</h5>
					</div>
				</section>
			</div>
		</Wrapper>
	)
}
