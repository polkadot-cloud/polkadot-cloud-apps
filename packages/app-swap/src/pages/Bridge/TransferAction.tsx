// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapDappName } from 'consts'
import {
	getStablecoinAssetConfig,
	getStablecoinChainLabel,
} from 'consts/stablecoins'
import { emitNotification, getUid, removeUid } from 'global-bus'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { trackCrossChainDelivery, useSubmitExtrinsic } from 'tx-submit'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	ImportedAccount,
} from 'types'
import { SubmitTx } from 'ui-app/SubmitTx'
import { SendForm } from 'ui-core/input'
import { swapFeeReserve } from '../../library/Swap'
import { canFundTransfer } from './utils'

export const TransferAction = ({
	input,
	account,
	quote,
	networkFee,
	valid,
	revalidate,
	onSubmitted,
}: {
	input: CrossChainTransferInput
	account: ImportedAccount | null
	quote?: CrossChainTransfer
	networkFee?: bigint
	valid: boolean
	revalidate: () => Promise<CrossChainTransfer | undefined>
	onSubmitted: () => void
}) => {
	const { t } = useTranslation('swap')
	const { serviceApi } = useApi()
	const { uids } = useTxMeta()
	const balances = useStablecoinBalances(account?.address)
	const mounted = useRef(true)
	const checking = useRef(false)
	const [checkedQuote, setCheckedQuote] = useState<CrossChainTransfer>()
	const activeDelivery =
		useRef<ReturnType<typeof trackCrossChainDelivery>>(undefined)
	const signing = uids.some(
		(item) =>
			item.from === account?.address && item.submitted && !item.broadcasted,
	)
	const ready =
		valid &&
		!!quote &&
		!!account &&
		networkFee !== undefined &&
		!signing &&
		!balances.loading &&
		canFundTransfer(balances.balances, input, quote, swapFeeReserve(networkFee))
	const feeDisplay = {
		unit: input.feeAsset,
		units: getStablecoinAssetConfig(input.from, input.feeAsset)!.decimals,
	}
	const submission = useSubmitExtrinsic({
		tx: quote?.tx,
		from: {
			address: account?.address ?? null,
			source: account?.source ?? null,
		},
		shouldSubmit: ready,
		tag: 'stablecoin-cross-chain',
		dappName: SwapDappName,
		feePaymentOptions: serviceApi.stablecoins.fee.paymentOptions(
			input.from,
			input.feeAsset,
		),
		estimatedFee: networkFee,
		feeDisplay,
		callbackSubmit: () => {
			if (!quote) return
			activeDelivery.current = trackCrossChainDelivery(
				serviceApi,
				input,
				quote,
				{
					onDelivered: () =>
						emitNotification({
							title: t('crossChainComplete'),
							subtitle: t('crossChainCompleteOn', {
								chain: getStablecoinChainLabel(input.to),
							}),
						}),
					onUnconfirmed: () =>
						emitNotification({
							title: t('crossChainUnconfirmed'),
							subtitle: t('xcmStatusUnconfirmed'),
						}),
				},
			)
			onSubmitted()
		},
		callbackInBlock: () => {
			void balances.refresh()
		},
		callbackFinalized: () => {
			activeDelivery.current?.finalized()
			void balances.refresh()
		},
		callbackFailure: () => {
			activeDelivery.current?.failed()
		},
	})
	// Submit only after React has applied the newly checked transaction and fee.
	useEffect(() => {
		if (!checkedQuote || checkedQuote !== quote) return
		setCheckedQuote(undefined)
		if (ready) submission.onSubmit()
	}, [checkedQuote, quote, ready, submission.onSubmit])
	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
		}
	}, [])
	const onSubmit = async () => {
		if (!ready || checking.current || checkedQuote) return
		checking.current = true
		try {
			const checked = await revalidate()
			if (mounted.current && checked) setCheckedQuote(checked)
		} finally {
			checking.current = false
		}
	}
	useEffect(
		() => () => {
			const pending = getUid(submission.uid)
			if (pending && !pending.submitted && !pending.pending)
				removeUid(submission.uid)
		},
		[submission.uid],
	)
	return (
		<SendForm.Action>
			<SubmitTx
				{...submission}
				onSubmit={onSubmit}
				submitText={t('crossChainSend')}
				valid={ready && !checkedQuote}
				noMargin
				feeDisplay={feeDisplay}
				feeBalance={balances.getBalance(input.from, input.feeAsset)?.free ?? 0n}
				hideSigner
				transparent
			/>
		</SendForm.Action>
	)
}
