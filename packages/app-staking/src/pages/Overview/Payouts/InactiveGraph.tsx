// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import type { NominatorReward } from 'plugin-staking-api/types'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AveragePayoutLine, PayoutBar } from 'ui-graphs'

export const InactiveGraph = ({
	setLastReward,
}: {
	setLastReward: (reward: NominatorReward | undefined) => void
}) => {
	const { i18n, t } = useTranslation()
	const { network } = useNetwork()
	const { getThemeValue } = useThemeValues()
	const dateFormat = useDateFormat(i18n.resolvedLanguage)
	const { unit, units } = getStakingChainData(network)

	useEffect(() => {
		setLastReward(undefined)
	}, [])

	return (
		<>
			<PayoutBar
				days={19}
				height="150px"
				data={{ payouts: [], unclaimedPayouts: [], poolClaims: [] }}
				nominating={false}
				inPool={false}
				syncing={false}
				getThemeValue={getThemeValue}
				unit={unit}
				units={units}
				dateFormat={dateFormat}
				labels={{
					payout: t('payouts', { ns: 'app' }),
					poolClaim: t('poolClaim', { ns: 'app' }),
					unclaimedPayouts: t('unclaimedPayouts', { ns: 'app' }),
					pending: t('pending', { ns: 'app' }),
					poolShare: t('share', { ns: 'app' }),
				}}
			/>
			<div style={{ marginTop: '3rem' }}>
				<AveragePayoutLine
					days={19}
					average={10}
					height="65px"
					data={{ payouts: [], unclaimedPayouts: [], poolClaims: [] }}
					getThemeValue={getThemeValue}
					unit={unit}
					units={units}
					labels={{
						payout: t('payouts', { ns: 'app' }),
						dayAverage: t('dayAverage', { ns: 'app' }),
					}}
				/>
			</div>
		</>
	)
}
