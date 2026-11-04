// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapDappName } from 'consts'
import { AssetHubTokens, assetHubDecimals } from 'consts/assetHub'
import { getFeeTokenIcon } from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import { canFundExchange } from 'dedot-api/assetHub/math'
import { getUid, removeUid } from 'global-bus'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit'
import type { AssetHubMarket, AssetHubToken, ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { Dropdown } from 'ui-app/Dropdown'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ButtonSecondary } from 'ui-buttons'
import { SendForm } from 'ui-core/input'
import { ExchangeNotice } from '../ExchangeNotice'
import classes from './index.module.scss'

export const tokenOptions = AssetHubTokens.map((value) => ({
	value,
	label: value,
	icon: getFeeTokenIcon(value),
}))
export const formatUnits = (value: bigint, decimals: number) => {
	const scale = 10n ** BigInt(decimals)
	const fraction = (value % scale)
		.toString()
		.padStart(decimals, '0')
		.replace(/0+$/, '')
	return `${value / scale}${fraction ? `.${fraction}` : ''}`
}
export const tokenAmount = (amount: bigint, token: AssetHubToken) =>
	formatUnits(amount, assetHubDecimals(token))
export const percentage = (permill: number) => `${permill / 10_000}%`
export const messageOf = (error: unknown) =>
	error instanceof Error ? error.message : 'Unable to read Asset Hub state'

export const useAssetHubMarket = (address?: string) => {
	const { serviceApi } = useApi()
	const exchange = serviceApi.assetHub
	const [state, setState] = useState<{
		exchange: typeof exchange
		address?: string
		data?: AssetHubMarket
		error?: string
	}>({ exchange: undefined })
	useEffect(() => {
		if (!exchange) return
		let cancelled = false
		const onError = (error: unknown) => {
			if (!cancelled)
				setState((previous) => ({
					...(previous.exchange === exchange && previous.address === address
						? previous
						: { exchange, address }),
					error: messageOf(error),
				}))
		}
		let unsubscribe: (() => void) | undefined
		try {
			unsubscribe = exchange.subscribeMarket(
				address,
				(data) => {
					if (!cancelled) setState({ exchange, address, data })
				},
				onError,
			)
		} catch (error) {
			onError(error)
		}
		return () => {
			cancelled = true
			unsubscribe?.()
		}
	}, [exchange, address])
	const current =
		state.exchange === exchange && state.address === address ? state : undefined
	return { exchange, market: current?.data, error: current?.error }
}

export const AccountField = ({
	account,
	accounts,
	onSelect,
}: {
	account: ImportedAccount | null
	accounts: ImportedAccount[]
	onSelect: (account: ImportedAccount | null) => void
}) => {
	const { t } = useTranslation('swap')
	return (
		<SendForm.Segment title={t('account')} layer="raised">
			<div className={classes.accountDropdown}>
				<AccountDropdown
					key={`${account?.address}:${account?.source}`}
					initialAccount={account}
					accounts={accounts}
					onSelect={onSelect}
					placeholder={t(
						accounts.length ? 'selectSenderAccount' : 'noAccounts',
					)}
					disabled={!accounts.length}
				/>
			</div>
		</SendForm.Segment>
	)
}

export const SlippageField = ({
	value,
	onChange,
}: {
	value: number
	onChange: (value: number) => void
}) => {
	const { t } = useTranslation('swap')
	return (
		<label className={classes.setting}>
			{t('slippage')}
			<select
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			>
				{[10, 50, 100, 300, 500].map((bps) => (
					<option key={bps} value={bps}>
						{bps / 100}%
					</option>
				))}
			</select>
		</label>
	)
}

type TransactionActionProps = {
	tx?: SubmittableExtrinsic
	account: ImportedAccount | null
	feeAsset: AssetHubToken
	spends: Partial<Record<AssetHubToken, bigint>>
	valid: boolean
	label: string
	onComplete: () => void
}

export const TransactionAction = (props: TransactionActionProps) => (
	<TransactionActionInner
		key={`${props.account?.address}:${props.account?.source}:${props.feeAsset}:${props.tx?.toHex()}`}
		{...props}
	/>
)

const TransactionActionInner = ({
	tx,
	account,
	feeAsset,
	spends,
	valid,
	label,
	onComplete,
}: TransactionActionProps) => {
	const { t } = useTranslation('swap')
	const { serviceApi } = useApi()
	const balances = useStablecoinBalances(account?.address)
	const { uids } = useTxMeta()
	const submissionId = useId()
	const accountBusy = uids.some(
		(item) =>
			item.network === 'polkadot' &&
			item.from === account?.address &&
			(item.submitted || item.pending),
	)
	const [fee, setFee] = useState<bigint>()
	const [error, setError] = useState<string>()
	const [retry, setRetry] = useState(0)
	const payload = useMemo(
		() => serviceApi.stablecoins.fee.paymentOptions('statemint', feeAsset),
		[serviceApi, feeAsset],
	)
	const feeDisplay = useMemo(
		() => ({ unit: feeAsset, units: assetHubDecimals(feeAsset) }),
		[feeAsset],
	)
	const txHex = tx?.toHex()
	useEffect(() => {
		if (!tx || !account) return
		setFee(undefined)
		setError(undefined)
		let stale = false
		void serviceApi.stablecoins.fee
			.estimate({
				chain: 'statemint',
				symbol: feeAsset,
				tx,
				from: account.address,
				payloadOptions: payload,
			})
			.then((value) => {
				if (!stale) setFee(value)
			})
			.catch(() => {
				if (!stale) setError(t('feeUnavailable'))
			})
		return () => {
			stale = true
		}
	}, [txHex, account?.address, payload, feeAsset, serviceApi, retry])
	const feeEstimator = useCallback(async () => {
		if (fee === undefined) throw new Error('Fee not ready')
		return fee
	}, [fee])
	const feeBalance = balances.getBalance('statemint', feeAsset)
	const feeReserve = fee === undefined ? 0n : (fee * 110n + 99n) / 100n
	const funded = canFundExchange(
		balances.balances,
		spends,
		feeAsset,
		fee === undefined ? undefined : feeReserve,
	)
	const ready =
		valid &&
		!!tx &&
		!!account &&
		fee !== undefined &&
		!error &&
		funded &&
		!accountBusy &&
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
		feeEstimator,
		feeDisplay,
		callbackInBlock: () => {
			void balances.refresh()
			onComplete()
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
		<>
			<SendForm.Notes>
				<SendForm.Note label={t('networkFee')}>
					{error
						? '—'
						: fee === undefined
							? tx && account
								? t('estimatingFee')
								: '—'
							: `${tokenAmount(fee, feeAsset)} ${feeAsset}`}
				</SendForm.Note>
				{error && (
					<ExchangeNotice
						status="danger"
						action={
							<ButtonSecondary
								text={t('retry')}
								onClick={() => setRetry((value) => value + 1)}
							/>
						}
					>
						{error}
					</ExchangeNotice>
				)}
				{accountBusy && (
					<ExchangeNotice>{t('transactionInProgress')}</ExchangeNotice>
				)}
				{valid && account && fee !== undefined && !funded && (
					<ExchangeNotice status="danger">
						{t('insufficientBalance')}
					</ExchangeNotice>
				)}
			</SendForm.Notes>
			<SendForm.Action>
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
			</SendForm.Action>
		</>
	)
}

export const FeeField = ({
	value,
	onChange,
}: {
	value: AssetHubToken
	onChange: (token: AssetHubToken) => void
}) => {
	const { t } = useTranslation('swap')
	return (
		<SendForm.Segment title={t('payFeesIn')}>
			<Dropdown
				options={tokenOptions}
				selected={tokenOptions.find((option) => option.value === value)!}
				onSelect={(option) => onChange(option.value)}
				variant="full"
			/>
		</SendForm.Segment>
	)
}

export { classes as exchangeClasses }
