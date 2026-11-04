// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils'
import {
	getStablecoinAssetConfig,
	getStablecoinChainLabel,
} from 'consts/stablecoins'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type {
	CrossChainFee,
	CrossChainTransfer,
	CrossChainTransferInput,
} from 'types'
import { EstimatedTxFee } from 'ui-app/EstimatedTxFee'
import { SendForm } from 'ui-core/input'
import { QuoteNotes, QuoteRoute } from '../../library/QuoteSummary'

const displayFee = (fee?: CrossChainFee) =>
	fee ? `${planckToUnit(fee.amount, fee.decimals)} ${fee.symbol}` : '—'

export const TransferSummary = ({
	input: { from, to, symbol, feeAsset },
	quote,
	networkFee,
	feeSetupUid,
	loading,
	children,
}: {
	input: CrossChainTransferInput
	quote?: CrossChainTransfer
	networkFee?: bigint
	feeSetupUid?: number
	loading: boolean
	children?: ReactNode
}) => {
	const { t } = useTranslation('swap')
	const feeDecimals = getStablecoinAssetConfig(from, feeAsset)!.decimals
	const destinationDecimals = getStablecoinAssetConfig(to, symbol)!.decimals
	return (
		<QuoteNotes>
			<QuoteRoute loading={loading} loadingText={t('checkingCrossChain')}>
				{quote &&
					`${getStablecoinChainLabel(from)} → ${getStablecoinChainLabel(to)}`}
			</QuoteRoute>
			<SendForm.Note label={t('networkFee')}>
				{feeSetupUid !== undefined ? (
					<EstimatedTxFee
						uid={feeSetupUid}
						feeDisplay={{ unit: feeAsset, units: feeDecimals }}
					/>
				) : networkFee !== undefined ? (
					displayFee({
						amount: networkFee,
						symbol: feeAsset,
						decimals: feeDecimals,
					})
				) : (
					'—'
				)}
			</SendForm.Note>
			<SendForm.Note label={t('originXcmFee')}>
				{displayFee(quote?.originFee)}
			</SendForm.Note>
			<SendForm.Note label={t('destinationXcmFee')}>
				{displayFee(quote?.destinationFee)}
			</SendForm.Note>
			<SendForm.Note label={t('estimatedReceived')}>
				<strong>
					{quote
						? `${planckToUnit(quote.receivedAmount, destinationDecimals)} ${symbol}`
						: '—'}
				</strong>
			</SendForm.Note>
			{children}
		</QuoteNotes>
	)
}
