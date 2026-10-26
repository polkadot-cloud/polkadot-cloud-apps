// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isValidAddress } from '@polkadot-cloud/util-dedot'
import classNames from 'classnames'
import { getFeeTokenIcon } from 'consts/stablecoins'
import { swapDecimals } from 'consts/swap'
import { slippageLimit } from 'dedot-api/swap/math'
import { useStablecoinBalances, useTheme } from 'hooks'
import { useQuoteExpired } from 'hooks/useQuoteExpired'
import { useSwapQuote } from 'hooks/useSwapQuote'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount, SwapMode, SwapToken } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { ButtonSecondary } from 'ui-buttons'
import { Page, Tooltip } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import {
	ExchangeNotice,
	percentage,
	TransactionAction,
	tokenAmount,
	tokenOptions,
} from '../../library/Swap'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { maxSendableBalance, toPlanck } from '../Send/utils'
import classes from './index.module.scss'
import { defaultSlippageBps, SlippageControl } from './SlippageControl'

export const Swap = () => {
	const { t } = useTranslation('swap')
	const { themeElementRef } = useTheme()
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const balances = useStablecoinBalances(account?.address)
	const [assetIn, setAssetIn] = useState<SwapToken>('USDT')
	const [assetOut, setAssetOut] = useState<SwapToken>('dotUSD')
	const [amount, setAmount] = useState('')
	const [mode, setMode] = useState<SwapMode>('exactIn')
	const [amountOnTop, setAmountOnTop] = useState(true)
	const [feeAsset, setFeeAsset] = useState<SwapToken>('DOT')
	const [slippage, setSlippage] = useState(defaultSlippageBps)
	const [recipientEnabled, setRecipientEnabled] = useState(false)
	const [recipientAccount, setRecipientAccount] =
		useState<ImportedAccount | null>(null)
	const amountToken = mode === 'exactIn' ? assetIn : assetOut
	const quotedToken = mode === 'exactIn' ? assetOut : assetIn
	const parsed = toPlanck(amount, swapDecimals(amountToken))
	useEffect(() => {
		void balances.refresh()
	}, [balances.refresh])
	const recipient = recipientEnabled
		? (recipientAccount?.address ?? '')
		: (account?.address ?? '')
	const recipientValid = isValidAddress(recipient)
	const { quotes, quote, tx, fee, error, refresh, requestKey } = useSwapQuote({
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
	const routeLoading = parsed > 0n && !quotes && !error
	const renderAmountField = (editable: boolean) => {
		const token = editable ? amountToken : quotedToken
		const paying = editable === (mode === 'exactIn')
		const available = maxSendableBalance(
			balances.getBalance('statemint', token),
			undefined,
			0n,
		)
		return (
			<BalanceInputMulti
				label={t(paying ? 'youPay' : 'youReceive')}
				value={editable ? amount : (quotedAmount ?? '0.00')}
				{...(editable ? { onChange: setAmount } : { readOnly: true as const })}
				disabled={!editable && !quote}
				maxAvailable={editable && !paying ? '0' : tokenAmount(available, token)}
				maxDecimals={swapDecimals(token)}
				syncing={balances.loading}
				options={tokenOptions.filter(
					(option) => option.value !== (editable ? quotedToken : amountToken),
				)}
				selected={tokenOptions.find((option) => option.value === token)!}
				onSelect={(option) => {
					if (paying) setAssetIn(option.value)
					else setAssetOut(option.value)
					if (editable) setAmount('')
				}}
				ariaLabel={t(paying ? 'youPay' : 'youReceive')}
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
					<SendForm.Segment
						title={t('account', { ns: 'app' })}
						layer="raised"
						className={formClasses.firstSection}
					>
						<AccountDropdown
							key={`${account?.address}:${account?.source}`}
							initialAccount={account}
							accounts={accounts.accountsWithSigners}
							onSelect={accounts.setFromAccount}
							placeholder={
								accounts.accountsWithSigners.length
									? t('selectSenderAccount')
									: t('noAccounts', { ns: 'app' })
							}
							disabled={!accounts.accountsWithSigners.length}
						/>
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
								<AccountDropdown
									key={`${recipientAccount?.address}:${recipientAccount?.source}`}
									initialAccount={recipientAccount}
									accounts={accounts.accounts}
									onSelect={setRecipientAccount}
									placeholder={t('enterRecipientAddress')}
								/>
							</div>
						)}
					</SendForm.Segment>
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
					<SendForm.Segment
						title={t('payFeesIn')}
						className={formClasses.lastSection}
					>
						<Dropdown
							options={tokenOptions}
							selected={
								tokenOptions.find((option) => option.value === feeAsset)!
							}
							onSelect={(option) => setFeeAsset(option.value)}
							variant="full"
						/>
						<SlippageControl
							value={slippage}
							onChange={setSlippage}
							disabled={quote?.kind === 'psm'}
						/>
					</SendForm.Segment>
					{quotes?.length === 0 && (
						<ExchangeNotice padded>{t('noRoute')}</ExchangeNotice>
					)}
					{error && (
						<ExchangeNotice
							status="danger"
							padded
							action={<ButtonSecondary text={t('retry')} onClick={refresh} />}
						>
							{error}
						</ExchangeNotice>
					)}
					<TransactionAction
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
						label={t(
							quote?.kind === 'psm'
								? quote.assetIn === 'USDT'
									? 'mintDotUsd'
									: 'redeemDotUsd'
								: 'swapAssets',
						)}
						onComplete={() => {
							setAmount('')
							refresh()
						}}
					>
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
									<span
										className={classes.routePlaceholder}
										data-loading={routeLoading || undefined}
									>
										{routeLoading ? t('fetchingQuote') : '—'}
									</span>
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
						<SendForm.Note label={t('networkFee')}>
							{fee === undefined
								? '—'
								: `${tokenAmount(fee, feeAsset)} ${feeAsset}`}
						</SendForm.Note>
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
