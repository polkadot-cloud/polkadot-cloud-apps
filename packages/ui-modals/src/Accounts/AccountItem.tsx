// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAccountBalances } from 'hooks/useAccountBalances'
import { Fragment } from 'react/jsx-runtime'
import { AccountButton } from './AccountButton'
import { Delegates } from './Delegates'
import type { AccountItemProps } from './types'

export const AccountItem = ({
	source,
	address,
	delegates,
}: AccountItemProps) => {
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
