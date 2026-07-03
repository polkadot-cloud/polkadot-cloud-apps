// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useProxies } from '@polkadot-cloud/connect-proxies'
import { useEffect, useMemo, useState } from 'react'
import type { ActiveProxy, MaybeAddress } from 'types'
import type { SignerOption, UseProxySwitcher } from './types'

export const useProxySwitcher = (
	delegatorAddress: MaybeAddress,
	initialSigner: ActiveProxy | null,
	fromAccount: { address: string; source: string } | null,
): UseProxySwitcher => {
	const { getDelegates } = useProxies()
	const { accounts } = useImportedAccounts()

	// Get delegates for the account
	const delegatesData = getDelegates(delegatorAddress)
	const proxyDelegates = delegatesData?.delegates || []

	// Expand delegates by finding all imported accounts for each delegate address. The same address
	// may be imported from multiple sources
	const proxyAccounts = proxyDelegates.flatMap(({ delegate, proxyType }) => {
		const matchingAccounts = accounts.filter((acc) => acc.address === delegate)
		return matchingAccounts.map((account) => ({
			address: account.address,
			source: account.source,
			proxyType,
		}))
	})

	// Include fromAccount as first option (non-proxy), followed by proxy accounts
	const allSigners = fromAccount
		? [
				{
					address: fromAccount.address,
					source: fromAccount.source,
					proxyType: null, // null indicates this is not a proxy
				},
				...proxyAccounts,
			]
		: proxyAccounts

	// Stringify signers to ensure proper comparison
	const stringifiedSigners = useMemo(
		() => allSigners.map((s) => `${s.address}-${s.source}`),
		[allSigners],
	)

	// Current proxy account - only state we need
	const [currentSigner, setCurrentSigner] = useState<SignerOption | null>(
		initialSigner || (allSigners.length > 0 ? allSigners[0] : null),
	)

	// Derive current index from currentProxy and delegates
	const currentIndex = currentSigner
		? allSigners.findIndex(
				(d) =>
					d.address === currentSigner.address &&
					d.source === currentSigner.source,
			)
		: -1

	// Switch to next delegate
	const nextSigner = () => {
		if (allSigners.length <= 1) {
			return
		}
		const validIndex = currentIndex >= 0 ? currentIndex : 0
		const nextIndex = (validIndex + 1) % allSigners.length
		setCurrentSigner(allSigners[nextIndex])
	}

	// Switch to previous delegate
	const previousSigner = () => {
		if (allSigners.length <= 1) {
			return
		}
		const validIndex = currentIndex >= 0 ? currentIndex : 0
		const prevIndex = (validIndex - 1 + allSigners.length) % allSigners.length
		setCurrentSigner(allSigners[prevIndex])
	}

	// Update current proxy if delegates change and current proxy is no longer valid
	useEffect(() => {
		if (allSigners.length === 0) {
			setCurrentSigner(null)
			return
		}
		// If current proxy is not in the delegates list, reset to first delegate
		if (currentIndex === -1) {
			setCurrentSigner(allSigners[0])
		}
	}, [stringifiedSigners, currentIndex])

	return {
		currentSigner,
		hasMultipleSigners: allSigners.length > 1,
		onNextSigner: nextSigner,
		onPreviousSigner: previousSigner,
	}
}
