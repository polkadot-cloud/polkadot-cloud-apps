// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapQuoteExpiryMs } from 'consts/swap'
import { useEffect, useState } from 'react'

export const useQuoteExpired = (fetchedAt?: number): boolean => {
	const [expiredFetchedAt, setExpiredFetchedAt] = useState<number>()
	useEffect(() => {
		if (fetchedAt === undefined) return
		const remaining = fetchedAt + SwapQuoteExpiryMs - Date.now()
		if (remaining < 0) return
		const timer = setTimeout(
			() => setExpiredFetchedAt(fetchedAt),
			remaining + 1,
		)
		return () => clearTimeout(timer)
	}, [fetchedAt])
	return (
		fetchedAt !== undefined &&
		(expiredFetchedAt === fetchedAt ||
			Date.now() - fetchedAt > SwapQuoteExpiryMs)
	)
}
