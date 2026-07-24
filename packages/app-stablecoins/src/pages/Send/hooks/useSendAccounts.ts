// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { useEffect, useMemo, useState } from 'react'
import type { ImportedAccount } from 'types'
import { isSameImportedAccount } from '../utils'
import type { SendAccounts } from './types'

export const useSendAccounts = (): SendAccounts => {
	const { activeAccount } = useActiveAccount()
	const { accounts, accountHasSigner, getAccount } = useImportedAccounts()
	const accountsWithSigners = useMemo(
		() =>
			accounts.filter((account) =>
				accountHasSigner({
					address: account.address,
					source: account.source,
				}),
			),
		[accounts, accountHasSigner],
	)
	const activeImportedAccount = getAccount(activeAccount)
	const defaultFromAccount =
		activeImportedAccount &&
		accountHasSigner({
			address: activeImportedAccount.address,
			source: activeImportedAccount.source,
		})
			? activeImportedAccount
			: accountsWithSigners[0] || null
	const defaultToAccount =
		accounts.find(
			(account) => account.address !== defaultFromAccount?.address,
		) || null
	const [fromAccount, setFromAccount] = useState<ImportedAccount | null>(
		defaultFromAccount,
	)
	const [toAccount, setToAccount] = useState<ImportedAccount | null>(
		defaultToAccount,
	)

	useEffect(() => {
		const fromAccountExists = accountsWithSigners.some((account) =>
			isSameImportedAccount(account, fromAccount),
		)

		if (!fromAccountExists) {
			setFromAccount(defaultFromAccount)
		}
	}, [accountsWithSigners, defaultFromAccount, fromAccount])

	useEffect(() => {
		const toAccountExists = accounts.some((account) =>
			isSameImportedAccount(account, toAccount),
		)

		if (!toAccountExists) {
			setToAccount(defaultToAccount)
		}
	}, [accounts, defaultToAccount, toAccount])

	return {
		accounts,
		accountsWithSigners,
		fromAccount,
		setFromAccount,
		toAccount,
		setToAccount,
	}
}
