// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useStaking } from 'hooks/useStaking'
import { useSyncing } from 'hooks/useSyncing'
import { CardWrapper } from 'library/Card/Wrappers'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { BalanceChart } from './AccountBalance/BalanceChart'
import { BalanceLinks } from './AccountBalance/BalanceLinks'
import { ControllerPrompt } from './ControllerPrompt'
import { NetworkStats } from './NetworkSats'
import { Payouts } from './Payouts'
import { QuickActions } from './QuickActions'
import { Summaries } from './Summaries'

export const Overview = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { isBonding } = useStaking()
	const { pluginEnabled } = usePlugins()
	const { getStakingLedger } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { syncing, accountSynced } = useSyncing()
	const { isReadOnlyAccount } = useImportedAccounts()

	const { controllerUnmigrated } = getStakingLedger(activeAddress)

	// Fiat values result in a slightly larger height for Balance & Payouts
	const showFiat = pluginEnabled('staking_api') && network !== 'westend'

	const STATUS_HEIGHT = 220
	const PAYOUTS_HEIGHT = showFiat ? 385 : 380

	return (
		<>
			<Page.Title title={t('overview')} />
			{isBonding &&
				!syncing &&
				accountSynced(activeAddress) &&
				controllerUnmigrated &&
				!isReadOnlyAccount(activeAddress) && <ControllerPrompt />}
			<Page.Row>
				<Page.RowSection>
					<Summaries height={STATUS_HEIGHT} />
				</Page.RowSection>
				<Page.RowSection secondary hLast vLast>
					<QuickActions height={STATUS_HEIGHT} />
				</Page.RowSection>
			</Page.Row>
			<Page.Row>
				<Page.RowSection secondary>
					<CardWrapper height={PAYOUTS_HEIGHT}>
						<BalanceChart />
						<BalanceLinks />
					</CardWrapper>
				</Page.RowSection>
				<Page.RowSection hLast vLast>
					<CardWrapper style={{ minHeight: PAYOUTS_HEIGHT }}>
						<Payouts />
					</CardWrapper>
				</Page.RowSection>
			</Page.Row>
			<Page.Row>
				<NetworkStats />
			</Page.Row>
		</>
	)
}
