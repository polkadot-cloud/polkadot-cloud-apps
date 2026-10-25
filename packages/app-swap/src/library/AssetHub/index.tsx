// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleExclamation,
	faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { SwapDappName } from 'consts'
import { AssetHubTokens, assetHubDecimals } from 'consts/assetHub'
import { getFeeTokenIcon } from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import { canFundExchange } from 'dedot-api/assetHub/math'
import { getUid, removeUid } from 'global-bus'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit'
import type { AssetHubMarket, AssetHubToken, ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { Dropdown } from 'ui-app/Dropdown'
import { SubmitTx } from 'ui-app/SubmitTx'
import { SendForm } from 'ui-core/input'
import classes from './index.module.scss'

export const tokenOptions = AssetHubTokens.map((value) => ({
	value,
	label: value,
	icon: getFeeTokenIcon(value),
}))
const formatUnits = (value: bigint, decimals: number) => {
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
const messageOf = (error: unknown) =>
	error instanceof Error ? error.message : 'Unable to read Asset Hub state'

export const ExchangeNotice = ({
	children,
	status = 'warning',
	action,
	className,
}: {
	children: ReactNode
	status?: 'warning' | 'danger'
	action?: ReactNode
	className?: string
}) => (
	<div
		role={status === 'danger' ? 'alert' : 'status'}
		className={classNames(classes.transactionNotice, className, {
			[classes.dangerNotice]: status === 'danger',
			[classes.warningNotice]: status === 'warning',
		})}
	>
		<FontAwesomeIcon
			icon={status === 'danger' ? faCircleExclamation : faTriangleExclamation}
			className={classes.noticeIcon}
			aria-hidden
		/>
		<span className={classes.noticeCopy}>{children}</span>
		{action && <div className={classes.noticeAction}>{action}</div>}
	</div>
)

export const useAssetHubMarket = () => {
	const { serviceApi } = useApi()
	const exchange = serviceApi.assetHub
	const [revision, setRevision] = useState(0)
	const [state, setState] = useState<{
		exchange: typeof exchange
		data?: AssetHubMarket
		error?: string
	}>({ exchange: undefined })
	const refresh = useCallback(() => setRevision((value) => value + 1), [])
	useEffect(() => {
		if (!exchange) return
		let cancelled = false
		let running = false
		const fetch = async () => {
			if (running) return
			running = true
			try {
				const data = await exchange.market()
				if (!cancelled) setState({ exchange, data })
			} catch (error) {
				if (!cancelled)
					setState((previous) => ({
						...(previous.exchange === exchange ? previous : { exchange }),
						error: messageOf(error),
					}))
			} finally {
				running = false
			}
		}
		void fetch()
		const timer = setInterval(fetch, 15_000)
		return () => {
			cancelled = true
			clearInterval(timer)
		}
	}, [exchange, revision])
	const current = state.exchange === exchange ? state : undefined
	return { exchange, market: current?.data, error: current?.error, refresh }
}

export const AccountField = ({
	account,
	accounts,
	onSelect,
	className,
	children,
}: {
	account: ImportedAccount | null
	accounts: ImportedAccount[]
	onSelect: (account: ImportedAccount | null) => void
	className?: string
	children?: ReactNode
}) => {
	const { t } = useTranslation('swap')
	return (
		<SendForm.Segment title={t('account')} layer="raised" className={className}>
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
			{children}
		</SendForm.Segment>
	)
}

type TransactionActionProps = {
	tx?: SubmittableExtrinsic
	estimatedFee: bigint | undefined
	submissionKey: string
	account: ImportedAccount | null
	feeAsset: AssetHubToken
	spends: Partial<Record<AssetHubToken, bigint>>
	valid: boolean
	label: string
	onComplete: () => void
	children?: ReactNode
	notesClassName?: string
	beforeSubmit?: ReactNode
}

// Background quotes share a submission id until the user changes the request.
export const TransactionAction = (props: TransactionActionProps) => (
	<TransactionActionInner
		key={`${props.account?.address}:${props.account?.source}:${props.feeAsset}:${props.submissionKey}`}
		{...props}
	/>
)

const TransactionActionInner = ({
	tx,
	estimatedFee: fee,
	account,
	feeAsset,
	spends,
	valid,
	label,
	onComplete,
	children,
	notesClassName,
	beforeSubmit,
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
	const payload = useMemo(
		() => serviceApi.stablecoins.fee.paymentOptions('statemint', feeAsset),
		[serviceApi, feeAsset],
	)
	const feeDisplay = useMemo(
		() => ({ unit: feeAsset, units: assetHubDecimals(feeAsset) }),
		[feeAsset],
	)
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
		estimatedFee: fee,
		feeDisplay,
		signingNetworkInfo: { decimals: 10, tokenSymbol: 'DOT' },
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
			<SendForm.Notes className={notesClassName}>
				<SendForm.Note label={t('networkFee')}>
					{fee === undefined
						? '—'
						: `${tokenAmount(fee, feeAsset)} ${feeAsset}`}
				</SendForm.Note>
				{children}
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
				<div className={classes.transactionActions}>
					{beforeSubmit}
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
		</>
	)
}

export const FeeField = ({
	value,
	onChange,
	className,
	children,
}: {
	value: AssetHubToken
	onChange: (token: AssetHubToken) => void
	className?: string
	children?: ReactNode
}) => {
	const { t } = useTranslation('swap')
	return (
		<SendForm.Segment title={t('payFeesIn')} className={className}>
			<Dropdown
				options={tokenOptions}
				selected={tokenOptions.find((option) => option.value === value)!}
				onSelect={(option) => onChange(option.value)}
				variant="full"
			/>
			{children}
		</SendForm.Segment>
	)
}

export { classes as exchangeClasses }
