// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CrossChainQuoteDebounceMs } from 'consts/crossChain'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CrossChainTransfer, CrossChainTransferInput } from 'types'
import { useApi } from '../useApi'

type PreparedTransfer = {
	request: CrossChainTransferInput
	loading: boolean
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
	const xcm = serviceApi.stablecoins.xcm
	const [state, setState] = useState<PreparedTransfer>()
	const fetchRef =
		useRef<() => Promise<CrossChainTransfer | undefined>>(undefined)
	const refresh = useCallback(async () => fetchRef.current?.(), [])
	const key = `${input.from}:${input.to}:${input.symbol}:${input.amount}:${input.sender}:${input.recipient}:${input.feeAsset}`
	const request = useMemo(() => ({ ...input }), [key, serviceApi, enabled])
	useEffect(() => {
		if (!enabled || !xcm) return
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
				const quote = await xcm.prepare(request)
				if (stale) return
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
				if (!stale) {
					setState({ request, quote, networkFee, loading: false })
					return quote
				}
			} catch (error) {
				if (!stale)
					setState({
						request,
						loading: false,
						error:
							error instanceof Error
								? error.message
								: 'Unable to prepare cross-chain transfer',
					})
			} finally {
				running = false
			}
		}
		fetchRef.current = fetch
		const timer = setTimeout(fetch, CrossChainQuoteDebounceMs)
		return () => {
			stale = true
			fetchRef.current = undefined
			clearTimeout(timer)
		}
	}, [request])
	const current = enabled && state?.request === request ? state : undefined
	return {
		...current,
		loading: current?.loading ?? (enabled && !!xcm),
		refresh,
		key,
	}
}
