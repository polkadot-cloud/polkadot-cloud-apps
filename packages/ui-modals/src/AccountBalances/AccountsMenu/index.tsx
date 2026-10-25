// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { Polkicon } from '@polkadot-cloud/ui/polkicon'
import { ellipsisFn } from '@polkadot-cloud/utils'
import type { AccountListCategory } from 'hooks/useStakingAccountCategories'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { AccountSourceIcon } from 'ui-app/AccountDropdown'
import { AccountInput } from 'ui-core/input'
import classes from './index.module.scss'

interface AccountsMenuProps {
	categories: AccountListCategory[]
	account: ImportedAccount | null
	onSelect: (account: ImportedAccount | null) => void
}

export const AccountsMenu = ({
	categories,
	account,
	onSelect,
}: AccountsMenuProps) => {
	const { t } = useTranslation('modals')
	const { accounts, getAccount } = useImportedAccounts()
	const accountCategories = categories
		.map((category) => ({
			...category,
			accounts: category.items.map(getAccount).filter((item) => item !== null),
		}))
		.filter((category) => category.accounts.length > 0)
	const sourcesByAddress = useMemo(() => {
		const sources = new Map<string, Set<string>>()
		for (const { address, source } of accounts) {
			const accountSources = sources.get(address) ?? new Set<string>()
			accountSources.add(source)
			sources.set(address, accountSources)
		}
		return sources
	}, [accounts])

	return (
		<aside className={classes.sidebar}>
			<AccountInput.ListContainer
				className={classes.accountList}
				ariaLabel={t('accounts', { ns: 'app' })}
			>
				{accountCategories.map(({ key, labelKey, accounts }) => (
					<fieldset key={key} className={classes.accountGroup}>
						{labelKey && (
							<legend className={classes.groupHeading}>{t(labelKey)}</legend>
						)}
						{accounts.map((item) => (
							<AccountInput.ListItem
								key={`${item.address}:${item.source}`}
								className={classes.accountRow}
								account={item}
								isSelected={
									account?.address === item.address &&
									account.source === item.source
								}
								onClick={onSelect}
							>
								<span className={classes.identicon} aria-hidden>
									<Polkicon
										address={item.address}
										fontSize="2rem"
										background="transparent"
									/>
								</span>
								<AccountInput.InnerLeft>
									<AccountInput.ListName
										name={item.name || ellipsisFn(item.address, 6)}
									/>
								</AccountInput.InnerLeft>
								{(sourcesByAddress.get(item.address)?.size ?? 0) > 1 && (
									<AccountSourceIcon
										source={item.source}
										className={classes.sourceIcon}
									/>
								)}
							</AccountInput.ListItem>
						))}
					</fieldset>
				))}
			</AccountInput.ListContainer>
		</aside>
	)
}
