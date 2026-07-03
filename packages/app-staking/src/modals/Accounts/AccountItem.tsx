// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Proxy } from '@polkadot-cloud/connect-proxies'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { Fragment } from 'react/jsx-runtime'
import { AccountButton } from './AccountButton'
import { Delegates } from './Delegates'

export const AccountItem = ({
	source,
	address,
	delegates,
}: {
	source: string
	address: string
	delegates?: Proxy
}) => {
	const {
		balances: { transferableBalance },
	} = useAccountBalances(address)

	return (
		<Fragment>
			<AccountButton
				transferableBalance={transferableBalance}
				address={address}
				source={source}
			/>
			{address && (
				<Delegates delegator={address} source={source} delegates={delegates} />
			)}
		</Fragment>
	)
}
