// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import type { ProxyDelegateWithBalance } from '@polkadot-cloud/connect-proxies'
import { isSupportedProxy } from '@polkadot-cloud/connect-proxies'
import type { DelegatesProps } from '../types'
import { DelegateItem } from './DelegateItem'
import { DelegatesWrapper } from './Wrapper'

export const Delegates = ({ delegates, source, delegator }: DelegatesProps) => {
	const { accounts } = useImportedAccounts()

	// Filter delegates that are external or not imported. Default to empty array if there are no
	// delegates for this address.
	const delegatesList = (delegates?.delegates.filter(
		({ delegate, proxyType }) =>
			accounts.find(({ address }) => address === delegate) !== undefined &&
			isSupportedProxy(proxyType) &&
			accounts.find(({ address }) => address === delegate)?.source !==
				'external',
	) || []) as ProxyDelegateWithBalance[]

	return delegatesList.length ? (
		<DelegatesWrapper>
			{delegatesList.map(({ delegate, proxyType }) => (
				<DelegateItem
					key={`_del_${delegate}_${proxyType}`}
					delegator={delegator}
					proxyType={proxyType}
					source={source}
					delegate={delegate}
				/>
			))}
		</DelegatesWrapper>
	) : null
}
