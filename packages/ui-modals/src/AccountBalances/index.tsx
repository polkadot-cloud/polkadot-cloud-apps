// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { ellipsisFn } from '@polkadot-cloud/utils'
import { useStablecoinAccountCategories } from 'hooks/useStablecoinAccountCategories'
import { useStablecoinBalances } from 'hooks/useStablecoinBalances'
import type { UseAccountListCategories } from 'hooks/useStakingAccountCategories'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { AccountDropdown, AccountSourceIcon } from 'ui-app/AccountDropdown'
import { ButtonCopy } from 'ui-app/ButtonCopy'
import { ModalTitle } from 'ui-app/ModalTitle'
import { PopoverTab } from 'ui-buttons'
import { Identity } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { AccountsMenu } from './AccountsMenu'
import { AllBalances } from './AllBalances'
import classes from './index.module.scss'
import { StablecoinMix } from './StablecoinMix'

export type AccountBalancesOptions = {
	initialAccount: ImportedAccount | null
	onSelect: (account: ImportedAccount | null) => void
}

export interface AccountBalancesProps {
	useCategories?: UseAccountListCategories
}

export const AccountBalances = ({
	useCategories = useStablecoinAccountCategories,
}: AccountBalancesProps = {}) => {
	const { t } = useTranslation('modals')
	const categories = useCategories()
	const { activeAccount } = useActiveAccount()
	const { options } = useOverlay().modal.config
	const { accounts, getAccount } = useImportedAccounts()

	const { initialAccount, onSelect } = (options ??
		{}) as Partial<AccountBalancesOptions>

	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(initialAccount ?? null)
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')

	const sortedAccounts = useMemo(
		() =>
			[...accounts].sort(
				(a, b) =>
					(a.name?.trim() || a.address).localeCompare(
						b.name?.trim() || b.address,
						undefined,
						{ sensitivity: 'base' },
					) ||
					a.address.localeCompare(b.address) ||
					a.source.localeCompare(b.source),
			),
		[accounts],
	)
	const account =
		accounts.find(
			(item) =>
				item.address === selectedAccount?.address &&
				item.source === selectedAccount?.source,
		) ??
		getAccount(activeAccount) ??
		sortedAccounts[0] ??
		null

	const { loading: syncing, refresh } = useStablecoinBalances(account?.address)
	useEffect(() => {
		void refresh()
	}, [refresh])

	const selectAccount = (nextAccount: ImportedAccount | null) => {
		setSelectedAccount(nextAccount)
		onSelect?.(nextAccount)
	}

	return (
		<div className={classes.modal}>
			<ModalTitle title={t('accounts', { ns: 'app' })} />
			<div className={classes.layout}>
				<AccountsMenu
					accounts={accounts}
					categories={categories}
					account={account}
					onSelect={selectAccount}
				/>
				<div className={classes.balancesPane}>
					<div className={classes.mobileSelector}>
						<AccountDropdown
							key={`${account?.address}:${account?.source}`}
							accounts={accounts}
							initialAccount={account}
							onSelect={selectAccount}
							label={t('account', { ns: 'modals' })}
							placeholder={
								accounts.length
									? t('selectAccount', { ns: 'app' })
									: t('noAccounts')
							}
							disabled={!accounts.length}
							allowCustomAccounts={false}
						/>
					</div>
					{account ? (
						<>
							<div className={classes.selectedAccount}>
								<Identity
									address={account.address}
									iconSize="3rem"
									label={
										<span className={classes.accountName}>
											{account.name || ellipsisFn(account.address, 6)}
											<AccountSourceIcon
												source={account.source}
												className={classes.sourceIcon}
											/>
										</span>
									}
									value={ellipsisFn(account.address, 8)}
									Action={<ButtonCopy value={account.address} size="0.9rem" />}
								/>
							</div>
							<div className={classes.balanceViews} aria-busy={syncing}>
								{syncing && (
									<span
										aria-label={t('syncingBalances')}
										aria-live="polite"
										role="status"
									/>
								)}
								<PopoverTab.Container
									style={{ borderBlock: '1px solid var(--gray-500)' }}
								>
									{(['balances', 'mix'] as const).map((tab) => (
										<PopoverTab.Button
											key={tab}
											text={t(tab)}
											active={activeTab === tab}
											style={{ borderRadius: 0 }}
											onClick={() => setActiveTab(tab)}
										/>
									))}
								</PopoverTab.Container>
								{activeTab === 'balances' ? (
									<AllBalances account={account} />
								) : (
									<StablecoinMix account={account} />
								)}
							</div>
						</>
					) : (
						<p className={classes.empty}>{t('noAccounts')}</p>
					)}
				</div>
			</div>
		</div>
	)
}
