// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApi } from '../useApi'
import { useQuoteExpired } from '../useQuoteExpired'
import type {
	PreparedSwapQuote,
	UseSwapQuote,
	UseSwapQuoteProps,
} from './types'

export const useSwapQuote = ({
	account,
	recipient,
	recipientValid,
	slippage,
	feeAsset,
	assetIn,
	assetOut,
	amount,
	mode,
}: UseSwapQuoteProps): UseSwapQuote => {
	const { serviceApi } = useApi()
	const { t } = useTranslation('swap')
	const exchange = serviceApi.swap
	const fetchRef = useRef<() => Promise<void>>(undefined)
	const refresh = useCallback(() => {
		void fetchRef.current?.()
	}, [])
	const [state, setState] = useState<PreparedSwapQuote>()
	// Market snapshots may refresh this request without invalidating its last
	// usable quote. User edits and account/service changes invalidate it immediately.
	const requestKey = `${account?.address}:${account?.source}:${assetIn}:${assetOut}:${mode}:${amount}:${recipient}:${recipientValid}:${slippage}:${feeAsset}`
	const request = useMemo(
		() => ({ assetIn, assetOut, amount, mode }),
		[requestKey, exchange, serviceApi],
	)
	useEffect(() => {
		if (!exchange || amount <= 0n || assetIn === assetOut) return
		let stale = false
		let running = false
		const fetch = async () => {
			if (running) return
			running = true
			setState((previous) => ({
				...(previous?.request === request ? previous : { request }),
				loading: true,
				error: undefined,
			}))
			try {
				const quotes = await exchange.quotes(request)
				if (stale) return
				const quote = quotes[0]
				const tx =
					quote && account && recipientValid
						? exchange.swap(quote, account.address, recipient, slippage)
						: undefined
				let fee: bigint | undefined
				if (tx && account) {
					try {
						fee = await serviceApi.stablecoins.fee.estimate({
							chain: 'statemint',
							symbol: feeAsset,
							tx,
							from: account.address,
							payloadOptions: serviceApi.stablecoins.fee.paymentOptions(
								'statemint',
								feeAsset,
							),
						})
					} catch {
						throw new Error(t('feeUnavailable'))
					}
				}
				if (!stale)
					setState({
						request,
						loading: false,
						quotes,
						quote,
						tx,
						fee,
					})
			} catch (error) {
				if (stale) return
				setState((previous) => ({
					...(previous?.request === request ? previous : { request }),
					loading: false,
					error:
						error instanceof Error
							? error.message
							: 'Unable to read Asset Hub state',
				}))
			} finally {
				running = false
			}
		}
		fetchRef.current = fetch
		const timer = setTimeout(fetch, 250)
		const poll = setInterval(fetch, 15_000)
		return () => {
			stale = true
			fetchRef.current = undefined
			clearTimeout(timer)
			clearInterval(poll)
		}
	}, [request])
	const current = state?.request === request ? state : undefined
	const expired = useQuoteExpired(current?.quote?.fetchedAt)
	useEffect(() => {
		if (expired) refresh()
	}, [expired, refresh])
	const loading =
		current?.loading ?? (!!exchange && amount > 0n && assetIn !== assetOut)
	return { ...current, loading, expired, requestKey, refresh }
}
