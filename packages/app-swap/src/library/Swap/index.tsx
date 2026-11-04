// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@polkadot-cloud/utils'
import { SwapDappName } from 'consts'
import { getFeeTokenIcon } from 'consts/stablecoins'
import { SwapTokens, swapDecimals } from 'consts/swap'
import type { SubmittableExtrinsic } from 'dedot'
import { getUid, removeUid } from 'global-bus'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import type { ReactNode } from 'react'
import { useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit'
import type { ImportedAccount, SwapToken } from 'types'
import { SubmitTx } from 'ui-app/SubmitTx'
import { SendForm } from 'ui-core/input'
import { canFundExchange, ceilDiv } from 'utils'
import { ExchangeNotice } from '../ExchangeNotice'
import { QuoteNotes } from '../QuoteSummary'
import classes from './index.module.scss'

export const tokenOptions = SwapTokens.map((value) => ({
	value,
	label: value,
	icon: getFeeTokenIcon(value),
}))
export const tokenAmount = (amount: bigint, token: SwapToken) =>
	planckToUnit(amount, swapDecimals(token)).replace(/\.?0+$/, '')
export const percentage = (permill: number) => `${permill / 10_000}%`
// Leave the same 10% fee margin in max-fill amounts and submission funding checks.
export const swapFeeReserve = (fee: bigint) => ceilDiv(fee * 110n, 100n)

type TransactionActionProps = {
	tx?: SubmittableExtrinsic
	estimatedFee: bigint | undefined
	submissionKey: string
	account: ImportedAccount | null
	feeAsset: SwapToken
	spends: Partial<Record<SwapToken, bigint>>
	valid: boolean
	label: string
	onSubmitted: () => void
	children?: ReactNode
}

// Keep quote rows mounted while a changed request starts a new submission.
export const TransactionAction = ({
	children,
	...props
}: TransactionActionProps) => (
	<>
		<QuoteNotes>{children}</QuoteNotes>
		<TransactionActionInner key={props.submissionKey} {...props} />
	</>
)

const TransactionActionInner = ({
	tx,
	estimatedFee: fee,
	account,
	feeAsset,
	spends,
	valid,
	label,
	onSubmitted,
}: TransactionActionProps) => {
	const { t } = useTranslation('swap')
	const { serviceApi } = useApi()
	const balances = useStablecoinBalances(account?.address)
	const { uids } = useTxMeta()
	const submissionId = useId()
	const accountSigning = uids.some(
		(item) =>
			item.network === 'polkadot' &&
			item.from === account?.address &&
			item.submitted &&
			!item.broadcasted,
	)
	const payload = useMemo(
		() => serviceApi.stablecoins.fee.paymentOptions('statemint', feeAsset),
		[serviceApi, feeAsset],
	)
	const feeDisplay = useMemo(
		() => ({ unit: feeAsset, units: swapDecimals(feeAsset) }),
		[feeAsset],
	)
	const feeBalance = balances.getBalance('statemint', feeAsset)
	const funded = canFundExchange(
		balances.balances,
		spends,
		feeAsset,
		fee === undefined ? undefined : swapFeeReserve(fee),
	)
	const ready =
		valid &&
		!!tx &&
		!!account &&
		fee !== undefined &&
		funded &&
		!accountSigning &&
		!balances.loading
	const submission = useSubmitExtrinsic({
		tx,
		from: {
			address: account?.address ?? null,
			source: account?.source ?? null,
		},
		shouldSubmit: ready,
		tag: `asset-hub-exchange:${submissionId}`,
		dappName: SwapDappName,
		feePaymentOptions: payload,
		estimatedFee: fee,
		feeDisplay,
		callbackSubmit: onSubmitted,
		callbackInBlock: () => {
			void balances.refresh()
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
			<div className={classes.transactionActions}>
				{valid && account && fee !== undefined && !funded && (
					<ExchangeNotice status="danger">
						{t('insufficientBalance')}
					</ExchangeNotice>
				)}
				<SubmitTx
					{...submission}
					submitText={label}
					valid={ready}
					noMargin
					feeDisplay={feeDisplay}
					feeBalance={feeBalance?.free ?? 0n}
					hideSigner
					transparent
				/>
			</div>
		</SendForm.Action>
	)
}
