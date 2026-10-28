// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainHeadBlockNotPinnedError, ChainHeadBlockPrunedError } from 'dedot'
import type { SwapInterface, SwapQuote } from 'types'
import { assertSwapAmount } from 'utils'
import { quoteAmm } from './amm'
import { quotePsm } from './psm'
import { buildSwapTransaction } from './transaction'
import type { SwapApi } from './types'

const isUnavailableBlock = (error: unknown) =>
	error instanceof ChainHeadBlockNotPinnedError ||
	error instanceof ChainHeadBlockPrunedError ||
	(error instanceof Error && error.message.startsWith('Block is not pinned'))

// Compares supported routes from one finalized snapshot before network fees.
export const createSwapInterface = (api: SwapApi): SwapInterface => {
	const readQuotes: SwapInterface['quotes'] = async (request) => {
		assertSwapAmount(request.amount)
		if (request.assetIn === request.assetOut) return []
		const fetchedAt = Date.now()
		const { hash } = await api.block.finalized()
		const at = await api.at(hash)
		const snapshot = { at, hash, fetchedAt }
		const routes = await Promise.all([
			quotePsm(snapshot, request),
			quoteAmm(snapshot, request),
		])
		return routes
			.filter((route): route is SwapQuote => !!route)
			.sort((a, b) => {
				// Highest output for a fixed input; lowest input for a fixed output.
				const difference =
					request.mode === 'exactIn'
						? b.amountOut - a.amountOut
						: a.amountIn - b.amountIn
				return difference < 0n ? -1 : difference > 0n ? 1 : 0
			})
	}

	return {
		quotes: async (request) => {
			try {
				return await readQuotes(request)
			} catch (error) {
				if (!isUnavailableBlock(error)) throw error
				// Retry the entire snapshot once; never retain a route from an unavailable block.
				return readQuotes(request)
			}
		},
		swap: (...args) => buildSwapTransaction(api, ...args),
	}
}
