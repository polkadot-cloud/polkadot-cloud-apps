// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { ellipsisFn } from '@polkadot-cloud/utils'
import { BalancesView } from 'library/Balances/BalancesView'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { AccountDropdown, getAccountSourceIcon } from 'ui-app/AccountDropdown'
import { ButtonCopy } from 'ui-app/ButtonCopy'
import { ModalTitle } from 'ui-app/ModalTitle'
import { Identity } from 'ui-core/base'
import { AccountInput } from 'ui-core/input'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

export type AccountsOptions = {
	initialAccount: ImportedAccount | null
	onSelect: (account: ImportedAccount | null) => void
}

export const Accounts = () => {
	const { t } = useTranslation('swap')
	const { options } = useOverlay().modal.config
	const { initialAccount, onSelect } = (options ??
		{}) as Partial<AccountsOptions>
	const { activeAccount } = useActiveAccount()
	const { accounts, getAccount } = useImportedAccounts()
	const [selectedAccount, setSelectedAccount] =
		useState<ImportedAccount | null>(initialAccount ?? null)
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
	const selectAccount = (nextAccount: ImportedAccount | null) => {
		setSelectedAccount(nextAccount)
		onSelect?.(nextAccount)
	}

	return (
		<div className={classes.modal}>
			<ModalTitle title={t('accounts', { ns: 'app' })} />
			<div className={classes.layout}>
				<aside className={classes.sidebar}>
					<AccountInput.ListContainer
						className={classes.accountList}
						ariaLabel={t('accounts', { ns: 'app' })}
					>
						{sortedAccounts.map((item) => {
							const SourceIcon = getAccountSourceIcon(item.source)
							return (
								<AccountInput.ListItem
									key={`${item.address}:${item.source}`}
									account={item}
									isSelected={
										account?.address === item.address &&
										account.source === item.source
									}
									onClick={selectAccount}
								>
									<span className={classes.identicon} aria-hidden>
										<Polkicon
											address={item.address}
											fontSize="2.25rem"
											background="transparent"
										/>
									</span>
									<AccountInput.InnerLeft>
										<AccountInput.ListName
											name={item.name || ellipsisFn(item.address, 6)}
										/>
										<AccountInput.Address address={item.address} />
									</AccountInput.InnerLeft>
									{SourceIcon ? (
										<AccountInput.SourceIcon SvgIcon={SourceIcon} />
									) : item.source === 'external' ? (
										<AccountInput.SourceIcon faIcon={faGlasses} />
									) : null}
								</AccountInput.ListItem>
							)
						})}
					</AccountInput.ListContainer>
				</aside>
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
									iconSize="2.25rem"
									label={account.name || ellipsisFn(account.address, 6)}
									value={ellipsisFn(account.address, 8)}
									Action={<ButtonCopy value={account.address} size="0.9rem" />}
								/>
							</div>
							<BalancesView account={account} />
						</>
					) : (
						<p className={classes.empty}>{t('noAccounts')}</p>
					)}
				</div>
			</div>
		</div>
	)
}
