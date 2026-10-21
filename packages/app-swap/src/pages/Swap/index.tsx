// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isValidAddress } from '@polkadot-cloud/util-dedot'
import { assetHubDecimals } from 'consts/assetHub'
import { slippageLimit } from 'dedot-api/assetHub/math'
import { useStablecoinBalances } from 'hooks'
import {
	AccountField,
	FeeField,
	messageOf,
	percentage,
	SlippageField,
	exchangeClasses as styles,
	TransactionAction,
	tokenAmount,
	tokenOptions,
	useAssetHubMarket,
	useNow,
} from 'library/AssetHub'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AssetHubSwapQuote, AssetHubToken, SwapMode } from 'types'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { maxSendableBalance, toPlanck } from '../Send/utils'

export const Swap = () => {
	const { t } = useTranslation('swap')
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const {
		exchange,
		market,
		error: marketError,
		refresh,
	} = useAssetHubMarket(account?.address)
	const balances = useStablecoinBalances(account?.address)
	const [assetIn, setAssetIn] = useState<AssetHubToken>('USDT')
	const [assetOut, setAssetOut] = useState<AssetHubToken>('dotUSD')
	const [amount, setAmount] = useState('')
	const [mode, setMode] = useState<SwapMode>('exactIn')
	const [feeAsset, setFeeAsset] = useState<AssetHubToken>('DOT')
	const [slippage, setSlippage] = useState(50)
	const [recipientEnabled, setRecipientEnabled] = useState(false)
	const [recipientInput, setRecipientInput] = useState('')
	const [route, setRoute] = useState<'auto' | 'amm' | 'psm'>('auto')
	const now = useNow()
	const [state, setState] = useState<{
		key: string
		quotes?: AssetHubSwapQuote[]
		error?: string
	}>()
	const amountToken = mode === 'exactIn' ? assetIn : assetOut
	const parsed = toPlanck(amount, assetHubDecimals(amountToken))
	const key = `${market?.hash}:${market?.fetchedAt}:${assetIn}:${assetOut}:${mode}:${parsed}`
	useEffect(() => {
		void balances.refresh()
	}, [account?.address, exchange])
	useEffect(() => {
		if (!market || !exchange || parsed <= 0n || assetIn === assetOut) return
		let stale = false
		const timer = setTimeout(() => {
			void exchange
				.quotes(market, { assetIn, assetOut, amount: parsed, mode })
				.then((quotes) => {
					if (!stale) setState({ key, quotes })
				})
				.catch((error) => {
					if (!stale) setState({ key, error: messageOf(error) })
				})
		}, 250)
		return () => {
			stale = true
			clearTimeout(timer)
		}
	}, [key, exchange])
	const current = state?.key === key ? state : undefined
	const quotes = current?.quotes
	const quote =
		route === 'auto' ? quotes?.[0] : quotes?.find((item) => item.kind === route)
	const expired = !!quote && now - quote.fetchedAt > 30_000
	const recipient = recipientEnabled
		? recipientInput.trim()
		: (account?.address ?? '')
	const recipientValid = isValidAddress(recipient)
	let tx
	let buildError: string | undefined
	if (exchange && quote && account && recipientValid && !expired) {
		try {
			tx = exchange.swap(quote, account.address, recipient, slippage)
		} catch (error) {
			buildError = messageOf(error)
		}
	}
	const maxInput = quote
		? quote.kind === 'amm' && mode === 'exactOut'
			? slippageLimit(quote.amountIn, slippage, true)
			: quote.amountIn
		: 0n
	const minOutput = quote
		? quote.kind === 'amm' && mode === 'exactIn'
			? slippageLimit(quote.amountOut, slippage)
			: quote.amountOut
		: 0n
	const inputBalance = balances.getBalance('statemint', amountToken)
	const max = maxSendableBalance(inputBalance, undefined, 0n)
	const routeLabel = (item: AssetHubSwapQuote) =>
		item.kind === 'psm'
			? t(item.assetIn === 'USDT' ? 'mintDotUsd' : 'redeemDotUsd')
			: item.path.join(' → ')
	const error = marketError || current?.error || buildError
	return (
		<Page.Row>
			<SendForm.Container className={formClasses.form}>
				<SendForm.Header
					title={t('swapAssets')}
					subtitle={t('swapDescription')}
					label="Beta"
				/>
				<SendForm.Card>
					<AccountField
						account={account}
						accounts={accounts.accountsWithSigners}
						onSelect={accounts.setFromAccount}
					/>
					<fieldset className={styles.tabs} aria-label={t('amountMode')}>
						<button
							type="button"
							className={styles.button}
							aria-pressed={mode === 'exactIn'}
							onClick={() => {
								setMode('exactIn')
								setAmount('')
							}}
						>
							{t('exactInput')}
						</button>
						<button
							type="button"
							className={styles.button}
							aria-pressed={mode === 'exactOut'}
							onClick={() => {
								setMode('exactOut')
								setAmount('')
							}}
						>
							{t('exactOutput')}
						</button>
					</fieldset>
					<BalanceInputMulti
						label={t(mode === 'exactIn' ? 'youPay' : 'youReceive')}
						value={amount}
						onChange={setAmount}
						maxAvailable={
							mode === 'exactIn' ? tokenAmount(max, amountToken) : '0'
						}
						maxDecimals={assetHubDecimals(amountToken)}
						syncing={balances.loading}
						options={tokenOptions.filter(
							(option) =>
								option.value !== (mode === 'exactIn' ? assetOut : assetIn),
						)}
						selected={
							tokenOptions.find((option) => option.value === amountToken)!
						}
						onSelect={(option) => {
							if (mode === 'exactIn') setAssetIn(option.value)
							else setAssetOut(option.value)
							setAmount('')
							setRoute('auto')
						}}
						ariaLabel={t(mode === 'exactIn' ? 'youPay' : 'youReceive')}
					/>
					<button
						type="button"
						className={styles.button}
						aria-label={t('reverseAssets')}
						onClick={() => {
							setAssetIn(assetOut)
							setAssetOut(assetIn)
							setAmount('')
							setRoute('auto')
						}}
					>
						↓↑
					</button>
					<SendForm.Segment
						title={t(mode === 'exactIn' ? 'youReceive' : 'youPay')}
					>
						<Dropdown
							options={tokenOptions.filter(
								(option) => option.value !== amountToken,
							)}
							selected={
								tokenOptions.find(
									(option) =>
										option.value === (mode === 'exactIn' ? assetOut : assetIn),
								)!
							}
							onSelect={(option) => {
								if (mode === 'exactIn') setAssetOut(option.value)
								else setAssetIn(option.value)
								setRoute('auto')
							}}
							variant="full"
						/>
						<output className={styles.output} aria-live="polite">
							{quote
								? tokenAmount(
										mode === 'exactIn' ? quote.amountOut : quote.amountIn,
										mode === 'exactIn' ? assetOut : assetIn,
									)
								: '—'}
						</output>
					</SendForm.Segment>
					{parsed > 0n && !quotes && !error && (
						<p className={styles.notice} role="status">
							{t('fetchingQuote')}
						</p>
					)}
					{quotes?.length === 0 && (
						<p className={styles.notice} role="status">
							{t('noRoute')}
						</p>
					)}
					{error && (
						<p className={styles.notice} role="alert">
							{error}{' '}
							<button type="button" className={styles.button} onClick={refresh}>
								{t('retry')}
							</button>
						</p>
					)}
					{quotes && quotes.length > 0 && (
						<details className={styles.details}>
							<summary>
								{t('route')}:{' '}
								{quote ? routeLabel(quote) : t('routeUnavailable')}
							</summary>
							<button
								type="button"
								className={`${styles.button} ${styles.route}`}
								aria-pressed={route === 'auto'}
								onClick={() => setRoute('auto')}
							>
								{t(mode === 'exactIn' ? 'bestOutput' : 'bestInput')}
							</button>
							{quotes.map((item) => (
								<button
									key={item.kind}
									type="button"
									className={`${styles.button} ${styles.route}`}
									aria-pressed={route === item.kind}
									onClick={() => setRoute(item.kind)}
								>
									<span>
										{routeLabel(item)} · {percentage(item.fee)}
									</span>
									<span>
										{tokenAmount(
											mode === 'exactIn' ? item.amountOut : item.amountIn,
											mode === 'exactIn' ? assetOut : assetIn,
										)}
									</span>
								</button>
							))}
							{market?.psm && (
								<p>
									{t('psmCapacity')}:{' '}
									{tokenAmount(
										market.psm.maxDebt > market.psm.debt
											? market.psm.maxDebt - market.psm.debt
											: 0n,
										'dotUSD',
									)}{' '}
									dotUSD · {t('minimumConversion')}:{' '}
									{tokenAmount(market.psm.minSwapAmount, 'dotUSD')}
								</p>
							)}
						</details>
					)}
					{quote && (
						<SendForm.Notes>
							<SendForm.Note
								label={t(
									mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent',
								)}
							>
								{tokenAmount(
									mode === 'exactIn' ? minOutput : maxInput,
									mode === 'exactIn' ? assetOut : assetIn,
								)}{' '}
								{mode === 'exactIn' ? assetOut : assetIn}
							</SendForm.Note>
							<SendForm.Note label={t('conversionFee')}>
								{percentage(quote.fee)}
							</SendForm.Note>
							<SendForm.Note label={t('priceImpact')}>
								{quote.priceImpactBps / 100}%
							</SendForm.Note>
						</SendForm.Notes>
					)}
					{quote?.kind === 'amm' && (
						<SlippageField value={slippage} onChange={setSlippage} />
					)}
					<label className={styles.setting}>
						{t('sendToAnotherAddress')}
						<input
							type="checkbox"
							checked={recipientEnabled}
							onChange={(event) => setRecipientEnabled(event.target.checked)}
						/>
					</label>
					{recipientEnabled && (
						<SendForm.Segment title={t('sendTo')}>
							<input
								className={styles.recipient}
								aria-label={t('enterRecipientAddress')}
								value={recipientInput}
								onChange={(event) => setRecipientInput(event.target.value)}
								placeholder={t('enterRecipientAddress')}
							/>
							{recipientInput && !recipientValid && (
								<p className={styles.notice} role="alert">
									{t('invalidRecipient')}
								</p>
							)}
						</SendForm.Segment>
					)}
					<FeeField value={feeAsset} onChange={setFeeAsset} />
					{expired && (
						<p className={styles.notice} role="status">
							{t('quoteExpired')}{' '}
							<button type="button" className={styles.button} onClick={refresh}>
								{t('refreshQuote')}
							</button>
						</p>
					)}
					<TransactionAction
						tx={tx}
						account={account}
						feeAsset={feeAsset}
						spends={{ [assetIn]: maxInput }}
						valid={!!quote && !expired && recipientValid && !error}
						label={quote?.kind === 'psm' ? routeLabel(quote) : t('swapAssets')}
						onComplete={() => {
							setAmount('')
							refresh()
						}}
					/>
				</SendForm.Card>
			</SendForm.Container>
		</Page.Row>
	)
}
