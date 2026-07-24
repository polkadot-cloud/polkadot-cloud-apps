// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SendForm } from './components/SendForm'
import { useSendAccounts } from './hooks/useSendAccounts'
import { useSendSelection } from './hooks/useSendSelection'
import { useSendTransaction } from './hooks/useSendTransaction'

export const Send = () => {
	const accounts = useSendAccounts()
	const selection = useSendSelection()
	const transaction = useSendTransaction({
		amount: selection.amount,
		chain: selection.chain,
		feeAsset: selection.feeAsset,
		fromAccount: accounts.fromAccount,
		toAccount: accounts.toAccount,
		token: selection.token,
	})

	return (
		<SendForm
			accounts={accounts}
			selection={selection}
			transaction={transaction}
		/>
	)
}
