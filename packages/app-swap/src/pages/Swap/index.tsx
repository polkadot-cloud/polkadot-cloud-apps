// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isValidAddress } from '@polkadot-cloud/util-dedot'
import classNames from 'classnames'
import { assetHubDecimals } from 'consts/assetHub'
import { getFeeTokenIcon } from 'consts/stablecoins'
import { slippageLimit } from 'dedot-api/assetHub/math'
import { useStablecoinBalances, useTheme } from 'hooks'
import {
	AccountField,
	ExchangeNotice,
	FeeField,
	percentage,
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
import { ButtonSecondary } from 'ui-buttons'
import { Page, ShineText, Tooltip } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { maxSendableBalance, toPlanck } from '../Send/utils'
import classes from './index.module.scss'
import { defaultSlippageBps, SlippageControl } from './SlippageControl'
import { useQuoteExpired } from './useQuoteExpired'
import { useSwapQuote } from './useSwapQuote'

export const Swap = () => {
	const { t } = useTranslation('swap')
	const { themeElementRef } = useTheme()
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const { exchange, market, error: marketError, refresh } = useAssetHubMarket()
	const balances = useStablecoinBalances(account?.address)
	const [assetIn, setAssetIn] = useState<AssetHubToken>('USDT')
	const [assetOut, setAssetOut] = useState<AssetHubToken>('dotUSD')
	const [amount, setAmount] = useState('')
	const [mode, setMode] = useState<SwapMode>('exactIn')
	const [amountOnTop, setAmountOnTop] = useState(true)
	const [feeAsset, setFeeAsset] = useState<AssetHubToken>('DOT')
	const [slippage, setSlippage] = useState(defaultSlippageBps)
	const [recipientEnabled, setRecipientEnabled] = useState(false)
	const [recipientAccount, setRecipientAccount] =
		useState<ImportedAccount | null>(null)
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
	})
	const quotedAmount = quote
		? tokenAmount(
				mode === 'exactIn' ? quote.amountOut : quote.amountIn,
				quotedToken,
			)
		: undefined
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
	const routeLoading = parsed > 0n && !quotes && !error
	const renderAmountField = (editable: boolean) => {
		const token = editable ? amountToken : quotedToken
		const fieldMode = editable
			? mode
			: mode === 'exactIn'
				? 'exactOut'
				: 'exactIn'
		return (
			<BalanceInputMulti
				label={t(fieldMode === 'exactIn' ? 'youPay' : 'youReceive')}
				value={editable ? amount : (quotedAmount ?? '0.00')}
				{...(editable ? { onChange: setAmount } : { readOnly: true as const })}
				disabled={!editable && !quote}
				maxAvailable={
					editable
						? mode === 'exactIn'
							? tokenAmount(max, amountToken)
							: '0'
						: tokenAmount(quotedAvailable, quotedToken)
				}
				maxDecimals={assetHubDecimals(token)}
				syncing={balances.loading}
				options={tokenOptions.filter(
					(option) => option.value !== (editable ? quotedToken : amountToken),
				)}
				selected={tokenOptions.find((option) => option.value === token)!}
				onSelect={(option) => {
					if (fieldMode === 'exactIn') setAssetIn(option.value)
					else setAssetOut(option.value)
					if (editable) setAmount('')
				}}
				ariaLabel={t(fieldMode === 'exactIn' ? 'youPay' : 'youReceive')}
			/>
		)
	}
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
					{renderAmountField(amountOnTop)}
					<SendForm.DirectionIndicator
						label={t('reverseAssets')}
						tooltip={t('reverseAssetsTooltip')}
						tooltipContainer={themeElementRef.current || undefined}
						onReverse={() => {
							setAssetIn(assetOut)
							setAssetOut(assetIn)
							if (amountOnTop) {
								setMode(mode === 'exactIn' ? 'exactOut' : 'exactIn')
							} else {
								setAmount(quotedAmount ?? '0.00')
							}
							setAmountOnTop(false)
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
									setAmountOnTop(true)
									setAmount('')
								}}
							>
								<FontAwesomeIcon icon={faArrowRightArrowLeft} />
								<span>{t(mode === 'exactIn' ? 'pay' : 'receive')}</span>
							</button>
						</Tooltip>
					</SendForm.DirectionIndicator>
					{renderAmountField(!amountOnTop)}
					<FeeField
						value={feeAsset}
						onChange={setFeeAsset}
						className={formClasses.lastSection}
					>
						<SlippageControl
							value={slippage}
							onChange={setSlippage}
							disabled={quote?.kind === 'psm'}
						/>
					</FeeField>
					{quotes?.length === 0 && (
						<ExchangeNotice className={styles.notice}>
							{t('noRoute')}
						</ExchangeNotice>
					)}
					{error && (
						<ExchangeNotice
							status="danger"
							className={styles.notice}
							action={<ButtonSecondary text={t('retry')} onClick={refresh} />}
						>
							{error}
						</ExchangeNotice>
					)}
					<SendForm.Notes className={classes.quoteNotes}>
						<section
							className={classes.route}
							aria-label={t('route')}
							aria-description={t(
								mode === 'exactIn' ? 'bestOutput' : 'bestInput',
							)}
						>
							<span>{t('route')}</span>
							<div
								className={classNames(classes.routeValue, {
									[classes.routeEmpty]: !quote && !routeLoading,
								})}
								aria-live="polite"
							>
								{quote ? (
									<ol className={classes.routePath} aria-label={t('route')}>
										{quote.path.map((token, index) => (
											<li key={token}>
												{index > 0 && <span aria-hidden>→</span>}
												<Tooltip
													text={token}
													container={themeElementRef.current || undefined}
													side="top"
												>
													<img src={getFeeTokenIcon(token)} alt={token} />
												</Tooltip>
											</li>
										))}
									</ol>
								) : (
									<ShineText
										className={classes.routePlaceholder}
										active={routeLoading}
									>
										{routeLoading ? t('fetchingQuote') : '—'}
									</ShineText>
								)}
							</div>
						</section>
						<SendForm.Note
							label={t(mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent')}
						>
							{quote
								? `${tokenAmount(
										mode === 'exactIn' ? minOutput : maxInput,
										mode === 'exactIn' ? assetOut : assetIn,
									)} ${mode === 'exactIn' ? assetOut : assetIn}`
								: '—'}
						</SendForm.Note>
					</SendForm.Notes>
					<TransactionAction
						notesClassName={classes.feeNotes}
						beforeSubmit={
							expired && (
								<ButtonSecondary
									text={t('refreshQuote')}
									size="lg"
									className={classes.refreshQuote}
									onClick={refresh}
								/>
							)
						}
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
					>
						<SendForm.Note label={t('conversionFee')}>
							{quote ? percentage(quote.fee) : '—'}
						</SendForm.Note>
						<SendForm.Note label={t('priceImpact')}>
							{quote ? `${quote.priceImpactBps / 100}%` : '—'}
						</SendForm.Note>
						{expired && <ExchangeNotice>{t('quoteExpired')}</ExchangeNotice>}
					</TransactionAction>
				</SendForm.Card>
			</SendForm.Container>
		</Page.Row>
	)
}
