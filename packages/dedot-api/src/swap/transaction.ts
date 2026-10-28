// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapQuoteExpiryMs, swapAssetId, swapLocation } from 'consts/swap'
import type { SubmittableExtrinsic } from 'dedot'
import type { SwapQuote } from 'types'
import { assertSwapAmount, slippageLimit } from 'utils'
import { asTx } from '../util'
import type { PsmTransactions, SwapApi } from './types'

// Encodes the quoted route, protecting its amounts, fee ceiling, and recipient atomically.
export const buildSwapTransaction = (
	api: SwapApi,
	quote: SwapQuote,
	address: string,
	recipient: string,
	slippageBps: number,
): SubmittableExtrinsic => {
	const age = Date.now() - quote.fetchedAt
	if (!Number.isFinite(age) || age < 0 || age > SwapQuoteExpiryMs)
		throw new Error('Quote expired. Refresh to continue.')
	assertSwapAmount(quote.amountIn)
	assertSwapAmount(quote.amountOut)
	if (quote.kind === 'psm') {
		const psmTx = api.tx.psm as unknown as PsmTransactions
		const mint = quote.assetIn === 'USDT'
		const call = (mint ? psmTx.mint : psmTx.redeem)(
			swapLocation('dotUSD'),
			swapLocation('USDT'),
			quote.amountIn,
			quote.fee,
		)
		if (address === recipient) return call
		const transfer = api.tx.assets.transfer(
			swapAssetId(mint ? 'dotUSD' : 'USDT'),
			recipient,
			quote.amountOut,
		)
		// A PSM credits the signer first; batchAll rolls back both calls if transfer fails.
		const batchAll = api.tx.utility.batchAll as unknown as (
			calls: SubmittableExtrinsic['call'][],
		) => SubmittableExtrinsic
		return batchAll([call.call, asTx(transfer).call])
	}
	const path = quote.path.map(swapLocation)
	return quote.mode === 'exactIn'
		? asTx(
				api.tx.assetConversion.swapExactTokensForTokens(
					path,
					quote.amountIn,
					slippageLimit(quote.amountOut, slippageBps),
					recipient,
					true,
				),
			)
		: asTx(
				api.tx.assetConversion.swapTokensForExactTokens(
					path,
					quote.amountOut,
					slippageLimit(quote.amountIn, slippageBps, 'maximum'),
					recipient,
					true,
				),
			)
}
