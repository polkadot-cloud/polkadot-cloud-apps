// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import { useApi } from 'hooks/useApi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount, SwapQuote, SwapRequest, SwapToken } from 'types'

type SwapQuoteOptions = SwapRequest & {
	account: ImportedAccount | null
	recipient: string
	recipientValid: boolean
	slippage: number
	feeAsset: SwapToken
}

type PreparedQuote = {
	request: SwapRequest
	quotes?: SwapQuote[]
	quote?: SwapQuote
	tx?: SubmittableExtrinsic
	fee?: bigint
	error?: string
}

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
}: SwapQuoteOptions) => {
	const { serviceApi } = useApi()
	const { t } = useTranslation('swap')
	const exchange = serviceApi.swap
	const [revision, setRevision] = useState(0)
	const refresh = useCallback(() => setRevision((value) => value + 1), [])
	const [state, setState] = useState<PreparedQuote>()
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
						quotes,
						quote,
						tx,
						fee,
					})
			} catch (error) {
				if (stale) return
				setState((previous) => ({
					...(previous?.request === request ? previous : { request }),
					error:
						error instanceof Error
							? error.message
							: 'Unable to read Asset Hub state',
				}))
			} finally {
				running = false
			}
		}
		const timer = setTimeout(fetch, 250)
		const poll = setInterval(fetch, 15_000)
		return () => {
			stale = true
			clearTimeout(timer)
			clearInterval(poll)
		}
	}, [request, revision])
	const current = state?.request === request ? state : undefined
	return { ...current, requestKey, refresh }
}
