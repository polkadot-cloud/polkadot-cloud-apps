// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxPayoutDays } from 'consts'
import { getStakingChainData } from 'consts/util'
import { useThemeValues } from 'contexts/ThemeValues'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import type { PayoutHistoryProps } from 'pages/Rewards/types'
import { useTranslation } from 'react-i18next'
import { AveragePayoutLine, PayoutBar } from 'ui-graphs'

type Props = Omit<
	PayoutHistoryProps & {
		nominating: boolean
		inPool: boolean
	},
	'payoutsList' | 'setPayoutsList'
>

export const ActiveGraph = ({
	nominating,
	inPool,
	payoutGraphData: { payouts, unclaimedPayouts, poolClaims, poolShareRewards },
	loading,
}: Props) => {
	const { i18n, t } = useTranslation()
	const { network } = useNetwork()
	const { activeAddress } = useActiveAccount()
	const { getThemeValue } = useThemeValues()
	const { unit, units } = getStakingChainData(network)
	const dateFormat = useDateFormat(i18n.resolvedLanguage)

	return (
		<>
			<PayoutBar
				days={MaxPayoutDays}
				height="165px"
				data={{ payouts, unclaimedPayouts, poolClaims, poolShareRewards }}
				nominating={nominating}
				inPool={inPool}
				syncing={loading}
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
				activeAccount={activeAddress || undefined}
			/>
			<div style={{ marginTop: '1rem' }}>
				<AveragePayoutLine
					days={MaxPayoutDays}
					average={10}
					height="65px"
					data={{ payouts, unclaimedPayouts, poolClaims }}
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
