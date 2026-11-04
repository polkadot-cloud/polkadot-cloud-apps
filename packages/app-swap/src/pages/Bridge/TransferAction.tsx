// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapDappName } from 'consts'
import {
	getStablecoinAssetConfig,
	getStablecoinChainLabel,
} from 'consts/stablecoins'
import { emitNotification, getUid, removeUid } from 'global-bus'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useCrossChainDeliveryStage } from 'hooks/useCrossChainDelivery'
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
import { ExchangeNotice, swapFeeReserve } from '../../library/Swap'
import { canFundTransfer } from './utils'

export const TransferAction = ({
	input,
	account,
	quote,
	networkFee,
	valid,
	onSubmitted,
}: {
	input: CrossChainTransferInput
	account: ImportedAccount | null
	quote?: CrossChainTransfer
	networkFee?: bigint
	valid: boolean
	onSubmitted: () => void
}) => {
	const { t } = useTranslation('swap')
	const { serviceApi } = useApi()
	const { uids } = useTxMeta()
	const balances = useStablecoinBalances(account?.address)
	const [delivery, setDelivery] =
		useState<ReturnType<typeof trackCrossChainDelivery>>()
	const activeDelivery = useRef(delivery)
	const stage = useCrossChainDeliveryStage(delivery?.state)
	const signing = uids.some(
		(item) =>
			item.from === account?.address && item.submitted && !item.broadcasted,
	)
	const ready =
		valid &&
		!!quote &&
		!!account &&
		networkFee !== undefined &&
		!stage &&
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
			const pending = trackCrossChainDelivery(serviceApi, input, quote, () =>
				emitNotification({
					title: t('crossChainComplete'),
					subtitle: t('crossChainCompleteOn', {
						chain: getStablecoinChainLabel(input.to),
					}),
				}),
			)
			activeDelivery.current = pending
			setDelivery(pending)
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
			<div style={{ width: '100%' }}>
				{stage === 'unconfirmed' && (
					<ExchangeNotice>{t('xcmStatusUnconfirmed')}</ExchangeNotice>
				)}
				<SubmitTx
					{...submission}
					submitText={t('crossChainSend')}
					valid={ready}
					noMargin
					feeDisplay={feeDisplay}
					feeBalance={
						balances.getBalance(input.from, input.feeAsset)?.free ?? 0n
					}
					hideSigner
					transparent
				/>
			</div>
		</SendForm.Action>
	)
}
