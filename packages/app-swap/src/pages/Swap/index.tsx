// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isValidAddress } from '@polkadot-cloud/util-dedot'
import { assetHubDecimals } from 'consts/assetHub'
import { slippageLimit } from 'dedot-api/assetHub/math'
import { useStablecoinBalances, useTheme } from 'hooks'
import {
	AccountField,
	FeeField,
	percentage,
	SlippageField,
	exchangeClasses as styles,
	TransactionAction,
	tokenAmount,
	tokenOptions,
	useAssetHubMarket,
} from 'library/AssetHub'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
	AssetHubSwapQuote,
	AssetHubToken,
	ImportedAccount,
	SwapMode,
} from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Page, Tooltip } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { maxSendableBalance, toPlanck } from '../Send/utils'
import classes from './index.module.scss'
import { useQuoteExpired } from './useQuoteExpired'
import { useSwapQuote } from './useSwapQuote'

export const Swap = () => {
	const { t } = useTranslation('swap')
	const { themeElementRef } = useTheme()
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
	const [recipientAccount, setRecipientAccount] =
		useState<ImportedAccount | null>(null)
	const [route, setRoute] = useState<'auto' | 'amm' | 'psm'>('auto')
	const amountToken = mode === 'exactIn' ? assetIn : assetOut
	const quotedToken = mode === 'exactIn' ? assetOut : assetIn
	const parsed = toPlanck(amount, assetHubDecimals(amountToken))
	useEffect(() => {
		void balances.refresh()
	}, [account?.address, exchange])
	const recipient = recipientEnabled
		? (recipientAccount?.address ?? '')
		: (account?.address ?? '')
	const recipientValid = isValidAddress(recipient)
	const {
		quotes,
		quote,
		tx,
		fee,
		error: quoteError,
		requestKey,
	} = useSwapQuote({
		exchange,
		market,
		account,
		assetIn,
		assetOut,
		amount: parsed,
		mode,
		recipient,
		recipientValid,
		slippage,
		feeAsset,
		route,
	})
	const expired = useQuoteExpired(quote?.fetchedAt)
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
	const quotedAvailable = maxSendableBalance(
		balances.getBalance('statemint', quotedToken),
		undefined,
		0n,
	)
	const routeLabel = (item: AssetHubSwapQuote) =>
		item.kind === 'psm'
			? t(item.assetIn === 'USDT' ? 'mintDotUsd' : 'redeemDotUsd')
			: item.path.join(' → ')
	const error = marketError || quoteError
	return (
		<Page.Row>
			<SendForm.Container className={`${formClasses.form} ${classes.form}`}>
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
						className={formClasses.firstSection}
					>
						<label className={classes.recipientSetting}>
							<input
								type="checkbox"
								checked={recipientEnabled}
								onChange={(event) => setRecipientEnabled(event.target.checked)}
							/>
							{t('sendToAnotherAddress')}
						</label>
						{recipientEnabled && (
							<div className={classes.recipientField}>
								<span className={classes.recipientLabel}>{t('sendTo')}</span>
								<div className={styles.accountDropdown}>
									<AccountDropdown
										key={`${recipientAccount?.address}:${recipientAccount?.source}`}
										initialAccount={recipientAccount}
										accounts={accounts.accounts}
										onSelect={setRecipientAccount}
										placeholder={t('enterRecipientAddress')}
									/>
								</div>
							</div>
						)}
					</AccountField>
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
					<SendForm.DirectionIndicator
						label={t('reverseAssets')}
						tooltip={t('reverseAssetsTooltip')}
						tooltipContainer={themeElementRef.current || undefined}
						onReverse={() => {
							setAssetIn(assetOut)
							setAssetOut(assetIn)
							setAmount('')
							setRoute('auto')
						}}
					>
						<Tooltip
							text={t('amountModeTooltip')}
							container={themeElementRef.current || undefined}
							side="top"
						>
							<button
								type="button"
								className={classes.modeToggle}
								aria-label={t(
									mode === 'exactIn' ? 'exactOutput' : 'exactInput',
								)}
								onClick={() => {
									setMode(mode === 'exactIn' ? 'exactOut' : 'exactIn')
									setAmount('')
								}}
							>
								<FontAwesomeIcon icon={faArrowRightArrowLeft} />
								<span>{t(mode === 'exactIn' ? 'pay' : 'receive')}</span>
							</button>
						</Tooltip>
					</SendForm.DirectionIndicator>
					<BalanceInputMulti
						label={t(mode === 'exactIn' ? 'youReceive' : 'youPay')}
						value={
							quote
								? tokenAmount(
										mode === 'exactIn' ? quote.amountOut : quote.amountIn,
										quotedToken,
									)
								: '0.00'
						}
						readOnly
						disabled={!quote}
						maxAvailable={tokenAmount(quotedAvailable, quotedToken)}
						syncing={balances.loading}
						maxDecimals={assetHubDecimals(quotedToken)}
						options={tokenOptions.filter(
							(option) => option.value !== amountToken,
						)}
						selected={
							tokenOptions.find((option) => option.value === quotedToken)!
						}
						onSelect={(option) => {
							if (mode === 'exactIn') setAssetOut(option.value)
							else setAssetIn(option.value)
							setRoute('auto')
						}}
						ariaLabel={t(mode === 'exactIn' ? 'youReceive' : 'youPay')}
					/>
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
					<FeeField
						value={feeAsset}
						onChange={setFeeAsset}
						className={formClasses.lastSection}
					/>
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
						estimatedFee={fee}
						submissionKey={requestKey}
						account={account}
						feeAsset={feeAsset}
						spends={{ [assetIn]: maxInput }}
						valid={!!quote && !!tx && !expired && recipientValid}
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
