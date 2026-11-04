// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isValidAddress } from '@polkadot-cloud/util-dedot'
import { planckToUnit } from '@polkadot-cloud/utils'
import { getStablecoinAssetConfig } from 'consts/stablecoins'
import { useApi, useStablecoinBalances, useTheme, useTxMeta } from 'hooks'
import { useCrossChainTransfer } from 'hooks/useCrossChainTransfer'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TxFeeEstimator } from 'tx-submit/types'
import type { CrossChainTransferInput, ImportedAccount } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Dropdown } from 'ui-app/Dropdown'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ButtonSecondary } from 'ui-buttons'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { maxSendableBalance } from 'utils'
import transferClasses from '../../library/AssetTransfer/index.module.scss'
import { chainOptions, findOption } from '../../library/AssetTransfer/options'
import { ExchangeNotice } from '../../library/ExchangeNotice'
import { swapFeeReserve } from '../../library/Swap'
import { useHydrationFeeSetup } from '../Send/hooks/useHydrationFeeSetup'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { TransferAction } from './TransferAction'
import { TransferSummary } from './TransferSummary'
import { useBridgeSelection } from './useBridgeSelection'
import {
	canFundTransfer,
	maxTransferAmount,
	parseTransferAmount,
} from './utils'

export const Bridge = () => {
	const { t } = useTranslation('swap')
	const { themeElementRef } = useTheme()
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const balances = useStablecoinBalances(account?.address)
	const {
		from,
		to,
		symbol,
		feeAsset,
		amount,
		tokenOptions,
		feeTokenOptions,
		destinationOptions,
		selectFrom,
		selectTo,
		reverse,
		setAmount,
		setSymbol,
		setFeeAsset,
	} = useBridgeSelection()
	const [customRecipient, setCustomRecipient] = useState(false)
	const [recipientAccount, setRecipientAccount] =
		useState<ImportedAccount | null>(null)
	const recipient = customRecipient
		? (recipientAccount?.address ?? '')
		: (account?.address ?? '')
	const decimals = getStablecoinAssetConfig(from, symbol)!.decimals
	const parsed = parseTransferAmount(amount, decimals)
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
	const validInput = !!account && recipientValid && parsed > 0n
	const enabled = validInput && setup.ready && !setup.needsSetup
	const { quote, networkFee, error, loading, refresh, key } =
		useCrossChainTransfer(input, enabled)
	const requestKey = `${key}:${account?.source}`
	const currentRequestKey = useRef(requestKey)
	useEffect(() => {
		currentRequestKey.current = requestKey
	}, [requestKey])
	const funded =
		!!quote &&
		networkFee !== undefined &&
		canFundTransfer(balances.balances, input, quote, swapFeeReserve(networkFee))
	const feeBalance = balances.getBalance(from, feeAsset)
	const maxAvailable = maxTransferAmount(
		balances.balances,
		input,
		quote,
		networkFee === undefined ? 0n : swapFeeReserve(networkFee),
	)
	const setupFee = getTxSubmission(setup.submission.uid)?.fee ?? 0n
	const setupFunded =
		setupFee > 0n &&
		maxSendableBalance(feeBalance, undefined, 0n) >= swapFeeReserve(setupFee)

	return (
		<Page.Row>
			<SendForm.Container
				className={`${formClasses.form} ${transferClasses.form}`}
			>
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
							options={chainOptions}
							selected={findOption(chainOptions, from)}
							onSelect={({ value }) => selectFrom(value)}
							variant="full"
						/>
					</SendForm.Segment>
					<SendForm.DirectionIndicator
						onReverse={reverse}
						label={t('reverseChains')}
						tooltip={t('reverseChains')}
						tooltipContainer={themeElementRef.current || undefined}
					/>
					<SendForm.Segment title={t('destinationChain')} layer="raised">
						<Dropdown
							options={destinationOptions}
							selected={findOption(destinationOptions, to)}
							onSelect={({ value }) => selectTo(value)}
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
							placeholder={
								accounts.accountsWithSigners.length
									? t('selectSenderAccount')
									: t('noAccounts', { ns: 'app' })
							}
						/>
						<label className={transferClasses.recipientSetting}>
							<input
								type="checkbox"
								checked={customRecipient}
								onChange={(event) => setCustomRecipient(event.target.checked)}
							/>
							{t('sendToAnotherAddress')}
						</label>
						{customRecipient && (
							<SendForm.Field
								title={t('sendTo')}
								className={transferClasses.recipientField}
							>
								<AccountDropdown
									key={`${recipientAccount?.address}:${recipientAccount?.source}`}
									initialAccount={recipientAccount}
									accounts={accounts.accounts}
									onSelect={setRecipientAccount}
									placeholder={t('enterRecipientAddress')}
								/>
							</SendForm.Field>
						)}
					</SendForm.Segment>
					<BalanceInputMulti
						label={t('assetToSend')}
						value={amount}
						onChange={setAmount}
						maxAvailable={planckToUnit(maxAvailable, decimals)}
						maxDecimals={decimals}
						allowMax={!!quote && !loading}
						syncing={balances.loading}
						options={tokenOptions}
						selected={findOption(tokenOptions, symbol)}
						onSelect={(token) => setSymbol(token.value)}
						ariaLabel={t('amountToSend')}
					/>
					<SendForm.Segment
						title={t('payFeesIn')}
						className={formClasses.lastSection}
					>
						<Dropdown
							options={feeTokenOptions}
							selected={findOption(feeTokenOptions, feeAsset)}
							onSelect={(token) => setFeeAsset(token.value)}
							variant="full"
						/>
					</SendForm.Segment>
					<TransferSummary
						input={input}
						quote={quote}
						networkFee={networkFee}
						feeSetupUid={setup.needsSetup ? setup.submission.uid : undefined}
						loading={loading || (validInput && setup.status === 'loading')}
					>
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
						{quote && !funded && !balances.loading && (
							<ExchangeNotice status="danger">
								{t('insufficientBalance')}
							</ExchangeNotice>
						)}
					</TransferSummary>
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
							key={requestKey}
							input={input}
							account={account}
							quote={quote}
							networkFee={networkFee}
							valid={enabled && !loading}
							onSubmitted={() => {
								// A wallet may broadcast after the user has already changed the form.
								if (currentRequestKey.current !== requestKey) return
								setAmount('')
							}}
						/>
					)}
				</SendForm.Card>
			</SendForm.Container>
		</Page.Row>
	)
}
