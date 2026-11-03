// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isValidAddress } from '@polkadot-cloud/util-dedot'
import { planckToUnit } from '@polkadot-cloud/utils'
import { getFeeTokenIcon, getStablecoinAssetConfig } from 'consts/stablecoins'
import { useApi, useStablecoinBalances, useTxMeta } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TxFeeEstimator } from 'tx-submit/types'
import type {
	CrossChainAsset,
	CrossChainFee,
	CrossChainTransferInput,
	ImportedAccount,
	StablecoinChainId,
} from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { EstimatedTxFee } from 'ui-app/EstimatedTxFee'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ButtonSecondary } from 'ui-buttons'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { maxSendableBalance } from 'utils'
import { ExchangeNotice, swapFeeReserve } from '../../library/Swap'
import { useHydrationFeeSetup } from '../Send/hooks/useHydrationFeeSetup'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import settingClasses from '../Swap/index.module.scss'
import { TransferAction } from './TransferAction'
import { useCrossChainTransfer } from './useCrossChainTransfer'
import { canFundTransfer, parseTransferAmount } from './utils'

const chains = [
	{ value: 'statemint', label: 'Polkadot Asset Hub' },
	{ value: 'hydration', label: 'Hydration' },
] satisfies { value: StablecoinChainId; label: string }[]
const tokens = (['USDC', 'USDT'] as const).map((value) => ({
	value,
	label: value,
	icon: getFeeTokenIcon(value),
}))
const feeTokens = (['DOT', 'USDC', 'USDT'] as const).map((value) => ({
	value,
	label: value,
	icon: getFeeTokenIcon(value),
}))
const displayFee = (fee?: CrossChainFee) =>
	fee ? `${planckToUnit(fee.amount, fee.decimals)} ${fee.symbol}` : '—'

export const Bridge = () => {
	const { t } = useTranslation('swap')
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const balances = useStablecoinBalances(account?.address)
	const [from, setFrom] = useState<StablecoinChainId>('statemint')
	const to = from === 'statemint' ? 'hydration' : 'statemint'
	const [symbol, setSymbol] = useState<CrossChainAsset>('USDC')
	const [feeAsset, setFeeAsset] =
		useState<CrossChainTransferInput['feeAsset']>('USDC')
	const [amount, setAmount] = useState('')
	const [customRecipient, setCustomRecipient] = useState(false)
	const [recipientAccount, setRecipientAccount] =
		useState<ImportedAccount | null>(null)
	const recipient = customRecipient
		? (recipientAccount?.address ?? '')
		: (account?.address ?? '')
	const parsed = parseTransferAmount(amount)
	const input: CrossChainTransferInput = {
		from,
		to,
		symbol,
		feeAsset,
		amount: parsed,
		sender: account?.address ?? '',
		recipient,
	}
	const feeDecimals = getStablecoinAssetConfig(from, feeAsset)!.decimals
	const feeDisplay = useMemo(
		() => ({ unit: feeAsset, units: feeDecimals }),
		[feeAsset, feeDecimals],
	)
	const feeEstimator = useMemo<TxFeeEstimator>(
		() =>
			({ tx, from: sender, feePaymentOptions }) =>
				serviceApi.stablecoins.fee.estimate({
					chain: from,
					symbol: feeAsset,
					tx,
					from: sender,
					payloadOptions: feePaymentOptions,
				}),
		[from, feeAsset, serviceApi],
	)
	const setup = useHydrationFeeSetup({
		chain: from,
		feeAsset,
		feeDisplay,
		feeEstimator,
		fromAccount: account,
		refreshBalances: balances.refresh,
	})
	useEffect(() => {
		void balances.refresh()
	}, [balances.refresh])
	const recipientValid = isValidAddress(recipient)
	const enabled =
		!!account &&
		recipientValid &&
		parsed > 0n &&
		setup.ready &&
		!setup.needsSetup
	const { quote, networkFee, error, expired, loading, refresh, key } =
		useCrossChainTransfer(input, enabled)
	const funded =
		!!quote &&
		networkFee !== undefined &&
		canFundTransfer(balances.balances, input, quote, swapFeeReserve(networkFee))
	const feeBalance = balances.getBalance(from, feeAsset)
	const originReserve =
		quote?.originFee.symbol === symbol && !quote.originFeeFromAmount
			? quote.originFee.amount
			: 0n
	const available = maxSendableBalance(
		balances.getBalance(from, symbol),
		feeBalance,
		networkFee === undefined ? 0n : swapFeeReserve(networkFee),
	)
	const maxAvailable =
		available > originReserve ? available - originReserve : 0n
	const setupFee = getTxSubmission(setup.submission.uid)?.fee ?? 0n
	const setupFunded =
		setupFee > 0n &&
		maxSendableBalance(feeBalance, undefined, 0n) >= swapFeeReserve(setupFee)
	const selectFrom = (chain: StablecoinChainId) => {
		setFrom(chain)
		setAmount('')
	}

	return (
		<Page.Row>
			<SendForm.Container className={formClasses.form}>
				<SendForm.Header
					title={t('bridge')}
					subtitle={t('crossChainDescription')}
				/>
				<SendForm.Card>
					<SendForm.Segment
						title={t('sourceChain')}
						layer="top"
						className={formClasses.firstSection}
					>
						<Dropdown
							options={chains}
							selected={chains.find((chain) => chain.value === from)!}
							onSelect={(chain) => selectFrom(chain.value)}
							variant="full"
						/>
					</SendForm.Segment>
					<SendForm.DirectionIndicator
						onReverse={() => selectFrom(to)}
						label={t('reverseChains')}
					/>
					<SendForm.Segment title={t('destinationChain')} layer="raised">
						<Dropdown
							options={chains}
							selected={chains.find((chain) => chain.value === to)!}
							onSelect={(chain) =>
								selectFrom(
									chain.value === 'statemint' ? 'hydration' : 'statemint',
								)
							}
							variant="full"
						/>
					</SendForm.Segment>
					<SendForm.Segment title={t('sendFrom')} layer="raised">
						<AccountDropdown
							key={`${account?.address}:${account?.source}`}
							initialAccount={account}
							accounts={accounts.accountsWithSigners}
							onSelect={accounts.setFromAccount}
							allowCustomAccounts={false}
							disabled={!accounts.accountsWithSigners.length}
							placeholder={t('selectSenderAccount')}
						/>
						<label className={settingClasses.recipientSetting}>
							<input
								type="checkbox"
								checked={customRecipient}
								onChange={(event) => setCustomRecipient(event.target.checked)}
							/>
							{t('sendToAnotherAddress')}
						</label>
						{customRecipient && (
							<div className={settingClasses.recipientField}>
								<AccountDropdown
									initialAccount={recipientAccount}
									accounts={accounts.accounts}
									onSelect={setRecipientAccount}
									placeholder={t('enterRecipientAddress')}
								/>
							</div>
						)}
					</SendForm.Segment>
					<BalanceInputMulti
						label={t('assetToSend')}
						value={amount}
						onChange={setAmount}
						maxAvailable={planckToUnit(maxAvailable, 6)}
						maxDecimals={6}
						allowMax={!!quote && !expired}
						syncing={balances.loading}
						options={tokens}
						selected={tokens.find((token) => token.value === symbol)!}
						onSelect={(token) => {
							setSymbol(token.value)
							setAmount('')
						}}
						ariaLabel={t('amountToSend')}
					/>
					<SendForm.Segment
						title={t('payFeesIn')}
						className={formClasses.lastSection}
					>
						<Dropdown
							options={feeTokens}
							selected={feeTokens.find((token) => token.value === feeAsset)!}
							onSelect={(token) => setFeeAsset(token.value)}
							variant="full"
						/>
					</SendForm.Segment>
					<SendForm.Notes>
						<SendForm.Note label={t('route')} variant="muted">
							{chains.find((chain) => chain.value === from)!.label} →{' '}
							{chains.find((chain) => chain.value === to)!.label}
						</SendForm.Note>
						<SendForm.Note label={t('networkFee')}>
							{setup.needsSetup ? (
								<EstimatedTxFee
									uid={setup.submission.uid}
									feeDisplay={feeDisplay}
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
						<SendForm.Note label={t('estimatedReceived')} variant="success">
							{quote
								? `${planckToUnit(quote.receivedAmount, 6)} ${symbol}`
								: '—'}
						</SendForm.Note>
						{loading && (
							<ExchangeNotice>{t('checkingCrossChain')}</ExchangeNotice>
						)}
						{setup.status === 'error' && (
							<ExchangeNotice status="danger">
								{t('feeUnavailable')}
							</ExchangeNotice>
						)}
						{error && (
							<ExchangeNotice
								status="danger"
								action={<ButtonSecondary text={t('retry')} onClick={refresh} />}
							>
								{error}
							</ExchangeNotice>
						)}
						{expired && (
							<ExchangeNotice
								action={<ButtonSecondary text={t('retry')} onClick={refresh} />}
							>
								{t('quoteExpired')}
							</ExchangeNotice>
						)}
						{quote && !funded && !balances.loading && (
							<ExchangeNotice status="danger">
								{t('insufficientBalance')}
							</ExchangeNotice>
						)}
					</SendForm.Notes>
					{setup.needsSetup ? (
						<SendForm.Action>
							<SubmitTx
								{...setup.submission}
								submitText={t('setFeeToken')}
								valid={setup.valid && setupFunded && !balances.loading}
								noMargin
								feeDisplay={feeDisplay}
								feeBalance={feeBalance?.free ?? 0n}
								hideSigner
								transparent
							/>
						</SendForm.Action>
					) : (
						<TransferAction
							key={`${key}:${account?.source}`}
							input={input}
							account={account}
							quote={quote}
							networkFee={networkFee}
							valid={enabled && !expired}
						/>
					)}
				</SendForm.Card>
			</SendForm.Container>
		</Page.Row>
	)
}
