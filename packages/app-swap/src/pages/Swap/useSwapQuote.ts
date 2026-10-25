// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import { useApi } from 'hooks/useApi'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
	AssetHubExchange,
	AssetHubMarket,
	AssetHubSwapQuote,
	AssetHubSwapRequest,
	AssetHubToken,
	ImportedAccount,
	ServiceInterface,
} from 'types'

type SwapQuoteOptions = AssetHubSwapRequest & {
	exchange?: AssetHubExchange
	market?: AssetHubMarket
	account: ImportedAccount | null
	recipient: string
	recipientValid: boolean
	slippage: number
	feeAsset: AssetHubToken
}

type PreparedQuote = {
	key: string
	exchange: AssetHubExchange
	serviceApi: ServiceInterface
	quotes?: AssetHubSwapQuote[]
	quote?: AssetHubSwapQuote
	tx?: SubmittableExtrinsic
	fee?: bigint
	error?: string
}

export const useSwapQuote = ({
	exchange,
	market,
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
	const [state, setState] = useState<PreparedQuote>()
	// Market snapshots may refresh this request without invalidating its last
	// usable quote. User edits and account/service changes invalidate it immediately.
	const requestKey = `${account?.address}:${account?.source}:${assetIn}:${assetOut}:${mode}:${amount}:${recipient}:${recipientValid}:${slippage}:${feeAsset}`
	useEffect(() => {
		if (!market || !exchange || amount <= 0n || assetIn === assetOut) return
		let stale = false
		const timer = setTimeout(() => {
			void (async () => {
				try {
					const quotes = await exchange.quotes(market, {
						assetIn,
						assetOut,
						amount,
						mode,
					})
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
							key: requestKey,
							exchange,
							serviceApi,
							quotes,
							quote,
							tx,
							fee,
						})
				} catch (error) {
					if (stale) return
					setState((previous) => ({
						...(previous?.key === requestKey &&
						previous.exchange === exchange &&
						previous.serviceApi === serviceApi
							? previous
							: { key: requestKey, exchange, serviceApi }),
						error:
							error instanceof Error
								? error.message
								: 'Unable to read Asset Hub state',
					}))
				}
			})()
		}, 250)
		return () => {
			stale = true
			clearTimeout(timer)
		}
	}, [market, exchange, requestKey, serviceApi])
	const current =
		state?.key === requestKey &&
		state.exchange === exchange &&
		state.serviceApi === serviceApi
			? state
			: undefined
	return { ...current, requestKey }
}
