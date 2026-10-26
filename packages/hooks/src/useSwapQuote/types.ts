// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SubmittableExtrinsic } from 'dedot'
import type { ImportedAccount, SwapQuote, SwapRequest, SwapToken } from 'types'

// Swap request, signer, recipient, and fee settings used to prepare a quote.
export type UseSwapQuoteProps = SwapRequest & {
	account: ImportedAccount | null
	recipient: string
	recipientValid: boolean
	slippage: number
	feeAsset: SwapToken
}

// Quotes, transaction, fee, and any error associated with one swap request.
export type PreparedSwapQuote = {
	request: SwapRequest
	quotes?: SwapQuote[]
	quote?: SwapQuote
	tx?: SubmittableExtrinsic
	fee?: bigint
	error?: string
}

// Current quote state, request identity, and a callback to refresh the quote.
export type UseSwapQuote = Partial<PreparedSwapQuote> & {
	requestKey: string
	refresh: () => void
}
