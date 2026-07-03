// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { AccountButton } from '../AccountButton'

export const DelegateItem = ({
	delegator,
	proxyType,
	delegate,
}: {
	delegator: string
	proxyType: string
	source: string
	delegate: string
}) => {
	const { accounts } = useImportedAccounts()
	const {
		balances: { transferableBalance },
	} = useAccountBalances(delegate)

	// Use the delegate's actual source rather than the delegator's source. The delegator may be an
	// external/read-only account, but the delegate (proxy) needs its real source to be recognized
	// as an imported account that can sign transactions.
	const delegateAccount = accounts.find(({ address }) => address === delegate)
	const delegateSource = delegateAccount?.source || 'external'

	return (
		<AccountButton
			transferableBalance={transferableBalance}
			address={delegate}
			source={delegateSource}
			delegator={delegator}
			proxyType={proxyType}
		/>
	)
}
