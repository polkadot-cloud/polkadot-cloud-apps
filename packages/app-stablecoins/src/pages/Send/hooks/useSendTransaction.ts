// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getStablecoinAssetConfig,
	isStablecoinSendAssetSupported,
} from 'consts/stablecoins'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	type TxFeeEstimator,
	useSubmitExtrinsic,
} from 'tx-submit/useSubmitExtrinsic'
import { isSameAddress, maxSendableBalance, toPlanck } from '../utils'
import type {
	ResolvedTransferTx,
	SendTransaction,
	UseSendTransactionProps,
} from './types'
import { useHydrationFeeSetup } from './useHydrationFeeSetup'

export const useSendTransaction = ({
	amount,
	chain,
	feeAsset,
	fromAccount,
	toAccount,
	token,
}: UseSendTransactionProps): SendTransaction => {
	const { t } = useTranslation('app')
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const [resolvedTransferTx, setResolvedTransferTx] =
		useState<ResolvedTransferTx>()
	const selectedAssetConfig = getStablecoinAssetConfig(chain, token)
	const selectedFeeAssetConfig = getStablecoinAssetConfig(chain, feeAsset)
	const selectedDecimals = selectedAssetConfig?.decimals ?? 0
	const selectedFeeDecimals = selectedFeeAssetConfig?.decimals ?? 0
	const amountPlanck = useMemo(
		() => toPlanck(amount, selectedDecimals),
		[amount, selectedDecimals],
	)
	const {
		getBalance,
		loading: balancesLoading,
		refresh: refreshBalances,
	} = useStablecoinBalances(fromAccount?.address)
	const selectedTokenBalance = getBalance(chain, token)
	const selectedFeeAssetBalance = getBalance(chain, feeAsset)
	const feeDisplay = useMemo(
		() => ({ unit: feeAsset, units: selectedFeeDecimals }),
		[feeAsset, selectedFeeDecimals],
	)
	const feePaymentOptions = serviceApi.stablecoins.fee.paymentOptions(
		chain,
		feeAsset,
	)
	const feeEstimator = useMemo<TxFeeEstimator>(
		() =>
			({ tx, from, feePaymentOptions: payloadOptions }) =>
				serviceApi.stablecoins.fee.estimate({
					chain,
					symbol: feeAsset,
					tx,
					from,
					payloadOptions,
				}),
		[chain, feeAsset, serviceApi],
	)
	const hydrationFeeSetup = useHydrationFeeSetup({
		chain,
		feeAsset,
		feeDisplay,
		feeEstimator,
		fromAccount,
		refreshBalances,
	})
	const transferKey =
		toAccount?.address &&
		amountPlanck > 0n &&
		isStablecoinSendAssetSupported(chain, token)
			? `${chain}:${token}:${toAccount.address}:${amountPlanck}`
			: null

	useEffect(() => {
		if (!transferKey || !toAccount?.address) {
			return
		}

		let stale = false
		void serviceApi.stablecoins.tx
			.transfer({
				chain,
				symbol: token,
				recipient: toAccount.address,
				amount: amountPlanck,
			})
			.then((tx) => {
				if (!stale) {
					setResolvedTransferTx({ key: transferKey, serviceApi, tx })
				}
			})
			.catch(() => {
				if (!stale) {
					setResolvedTransferTx({
						key: transferKey,
						serviceApi,
						tx: undefined,
					})
				}
			})

		return () => {
			stale = true
		}
	}, [amountPlanck, chain, serviceApi, toAccount?.address, token, transferKey])

	const transferTx =
		resolvedTransferTx?.key === transferKey &&
		resolvedTransferTx.serviceApi === serviceApi
			? resolvedTransferTx.tx
			: undefined
	const canSubmitTransfer =
		hydrationFeeSetup.ready && !hydrationFeeSetup.needsSetup
	const transferSubmission = useSubmitExtrinsic({
		tx: canSubmitTransfer ? transferTx : undefined,
		tag: 'stablecoin-send',
		from: {
			address: fromAccount?.address || null,
			source: fromAccount?.source || null,
		},
		shouldSubmit: canSubmitTransfer,
		feePaymentOptions,
		feeEstimator,
		feeDisplay,
		callbackInBlock: () => {
			void refreshBalances()
		},
	})
	const activeSubmission = hydrationFeeSetup.needsSetup
		? hydrationFeeSetup.submission
		: transferSubmission
	const activeFee = getTxSubmission(activeSubmission.uid)?.fee || 0n
	const maxAvailableToSend = maxSendableBalance(
		selectedTokenBalance,
		selectedFeeAssetBalance,
		hydrationFeeSetup.needsSetup ? 0n : activeFee,
	)
	const validTransfer =
		!!fromAccount?.address &&
		!!fromAccount.source &&
		!!toAccount?.address &&
		!isSameAddress(fromAccount, toAccount) &&
		amountPlanck > 0n &&
		!!selectedTokenBalance &&
		amountPlanck <= maxAvailableToSend &&
		!!transferTx &&
		canSubmitTransfer

	return {
		balancesLoading,
		feeDisplay,
		feeSetupRequired: hydrationFeeSetup.needsSetup,
		maxAvailableToSend,
		selectedDecimals,
		selectedFeeAssetBalance,
		submission: activeSubmission,
		submitText: hydrationFeeSetup.needsSetup
			? t('stablecoins.setFeeToken')
			: t('stablecoins.sendAssets'),
		valid: hydrationFeeSetup.needsSetup
			? hydrationFeeSetup.valid
			: validTransfer,
	}
}
