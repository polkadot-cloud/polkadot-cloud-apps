// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useMemo, useState } from 'react'
import type { CrossChainTransfer, CrossChainTransferInput } from 'types'
import { useApi } from '../useApi'
import { useQuoteExpired } from '../useQuoteExpired'

type PreparedTransfer = {
	request: object
	quote?: CrossChainTransfer
	networkFee?: bigint
	error?: string
}

// Changing any transfer detail invalidates the previous simulation immediately.
export const useCrossChainTransfer = (
	input: CrossChainTransferInput,
	enabled: boolean,
) => {
	const { serviceApi } = useApi()
	const [state, setState] = useState<PreparedTransfer>()
	const [refreshId, setRefreshId] = useState(0)
	const key = `${input.from}:${input.to}:${input.symbol}:${input.amount}:${input.sender}:${input.recipient}:${input.feeAsset}`
	const request = useMemo(
		() => ({ ...input }),
		[key, serviceApi, enabled, refreshId],
	)
	useEffect(() => {
		if (!enabled || !serviceApi.stablecoins.xcm) return
		let stale = false
		const timer = setTimeout(async () => {
			try {
				const quote = await serviceApi.stablecoins.xcm!.prepare(request)
				const networkFee = await serviceApi.stablecoins.fee.estimate({
					chain: request.from,
					symbol: request.feeAsset,
					tx: quote.tx,
					from: request.sender,
					payloadOptions: serviceApi.stablecoins.fee.paymentOptions(
						request.from,
						request.feeAsset,
					),
				})
				if (!stale) setState({ request, quote, networkFee })
			} catch (error) {
				if (!stale)
					setState({
						request,
						error:
							error instanceof Error
								? error.message
								: 'Unable to prepare cross-chain transfer',
					})
			}
		}, 400)
		return () => {
			stale = true
			clearTimeout(timer)
		}
	}, [request])
	const current = enabled && state?.request === request ? state : undefined
	const expired = useQuoteExpired(current?.quote?.fetchedAt)
	return {
		...current,
		expired,
		loading: enabled && !!serviceApi.stablecoins.xcm && !current,
		refresh: () => setRefreshId((value) => value + 1),
		key,
	}
}
