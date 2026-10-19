// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchGetValidatorWarnings } from 'plugin-staking-api'
import type { ValidatorWarnings } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'

const EMPTY_WARNINGS: ValidatorWarnings = {}

export const useValidatorWarnings = (
	network: string,
	candidates: string[],
	enabled: boolean,
	who: string | null,
	era: number,
) => {
	const candidatesKey = JSON.stringify(candidates)
	// A new selection gets its own request identity, even when revisiting a prior selection.
	const request = useMemo(
		() => ({ network, candidates, enabled: enabled && Boolean(who), who, era }),
		[network, candidatesKey, enabled, who, era],
	)
	const [result, setResult] = useState<{
		request: typeof request
		warnings: ValidatorWarnings
	}>()

	useEffect(() => {
		if (!request.enabled || request.candidates.length === 0) {
			return
		}
		let active = true
		void fetchGetValidatorWarnings(request.network, request.candidates, { who: request.who }).then(
			(warnings) => {
				if (active) {
					setResult({ request, warnings })
				}
			},
		)
		return () => {
			active = false
		}
	}, [request])

	const isLoading =
		request.enabled && candidates.length > 0 && result?.request !== request
	return {
		warnings:
			request.enabled && result?.request === request ? result.warnings : EMPTY_WARNINGS,
		isLoading,
	}
}
