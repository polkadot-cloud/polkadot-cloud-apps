// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleDown } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { minDecimalPlaces, planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePayouts } from 'hooks/usePayouts'
import { usePlugins } from 'hooks/usePlugins'
import { Stat } from 'library/Stat'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'

export const UnclaimedPayoutsStatus = () => {
	const { t } = useTranslation()
	const { network } = useNetwork()
	const { isReady } = useApi()
	const { openModal } = useOverlay().modal
	const {
		unclaimedRewards: { total },
	} = usePayouts()
	const { pluginEnabled } = usePlugins()
	const { activeAddress } = useActiveAccount()
	const { isReadOnlyAccount } = useImportedAccounts()
	const { units } = getStakingChainData(network)
	return (
		<Stat
			label={t('pendingPayouts', { ns: 'pages' })}
			helpKey="Payout"
			type="odometer"
			stat={{
				value:
					total === '0'
						? '0.00'
						: minDecimalPlaces(planckToUnit(total, units), 2),
			}}
			dimmed={total === '0'}
			buttons={
				total !== '0' &&
				pluginEnabled('staking_api') &&
				!isReadOnlyAccount(activeAddress)
					? [
							{
								title: t('claim', { ns: 'modals' }),
								icon: faCircleDown,
								disabled: !isReady,
								onClick: () =>
									openModal({
										key: 'ClaimPayouts',
										size: 'sm',
										options: {
											disableWindowResize: true,
											disableScroll: true,
										},
									}),
							},
						]
					: undefined
			}
		/>
	)
}
