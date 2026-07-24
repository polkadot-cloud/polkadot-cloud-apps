// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks'
import { useEffect, useState } from 'react'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import type {
	FeeCurrencyState,
	FeeCurrencyStatus,
	HydrationFeeSetup,
	ResolvedFeeSetupTx,
	UseHydrationFeeSetupProps,
} from './types'

export const useHydrationFeeSetup = ({
	chain,
	feeAsset,
	feeDisplay,
	feeEstimator,
	fromAccount,
	refreshBalances,
}: UseHydrationFeeSetupProps): HydrationFeeSetup => {
	const { serviceApi } = useApi()
	const [feeCurrencyState, setFeeCurrencyState] = useState<FeeCurrencyState>()
	const [resolvedTx, setResolvedTx] = useState<ResolvedFeeSetupTx>()
	const [refreshId, setRefreshId] = useState(0)
	const feeCurrencyKey =
		chain === 'hydration' && fromAccount?.address ? fromAccount.address : null

	useEffect(() => {
		if (!feeCurrencyKey) {
			return
		}

		let stale = false
		setFeeCurrencyState({ key: feeCurrencyKey, status: 'loading' })
		void serviceApi.stablecoins.query
			.hydrationFeeCurrency(feeCurrencyKey)
			.then((currency) => {
				if (!stale) {
					setFeeCurrencyState({
						currency,
						key: feeCurrencyKey,
						status: 'ready',
					})
				}
			})
			.catch(() => {
				if (!stale) {
					setFeeCurrencyState({ key: feeCurrencyKey, status: 'error' })
				}
			})

		return () => {
			stale = true
		}
	}, [feeCurrencyKey, refreshId, serviceApi])

	const activeFeeCurrencyState =
		feeCurrencyState?.key === feeCurrencyKey ? feeCurrencyState : undefined
	const status: FeeCurrencyStatus =
		chain !== 'hydration' || !feeCurrencyKey
			? 'idle'
			: activeFeeCurrencyState?.status || 'loading'
	const ready = chain !== 'hydration' || status === 'ready'
	const needsSetup =
		chain === 'hydration' &&
		status === 'ready' &&
		activeFeeCurrencyState?.currency !== feeAsset
	const feeSetupKey =
		needsSetup && feeCurrencyKey ? `${feeCurrencyKey}:${feeAsset}` : null

	useEffect(() => {
		if (!feeSetupKey) {
			return
		}

		let stale = false
		void serviceApi.stablecoins.tx
			.setHydrationFeeCurrency(feeAsset)
			.then((tx) => {
				if (!stale) {
					setResolvedTx({ key: feeSetupKey, tx })
				}
			})
			.catch(() => {
				if (!stale) {
					setResolvedTx({ key: feeSetupKey, tx: undefined })
				}
			})

		return () => {
			stale = true
		}
	}, [feeAsset, feeSetupKey, serviceApi])

	const tx = resolvedTx?.key === feeSetupKey ? resolvedTx.tx : undefined
	const submission = useSubmitExtrinsic({
		tx,
		tag: 'stablecoin-fee-setup',
		from: {
			address: fromAccount?.address || null,
			source: fromAccount?.source || null,
		},
		shouldSubmit: needsSetup,
		feeEstimator,
		feeDisplay,
		callbackInBlock: () => {
			void refreshBalances()
			setRefreshId((current) => current + 1)
		},
	})

	return {
		needsSetup,
		ready,
		status,
		submission,
		valid: needsSetup && !!tx,
	}
}
