// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	ceilDiv,
	liquidityContribution,
	liquidityWithdrawal,
	slippageLimit,
} from 'dedot-api/assetHub/math'
import { useStablecoinBalances } from 'hooks'
import {
	FeeField,
	messageOf,
	percentage,
	SlippageField,
	exchangeClasses as styles,
	TransactionAction,
	tokenAmount,
	tokenOptions,
} from 'library/AssetHub'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
	AssetHubExchange,
	AssetHubPool,
	AssetHubToken,
	ImportedAccount,
} from 'types'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { PageTabs } from 'ui-app/PageTabs'
import { SendForm } from 'ui-core/input'
import { maxSendableBalance } from 'utils'
import formClasses from '../Send/Send.module.scss'
import { toPlanck } from '../Send/utils'
import classes from './index.module.scss'

export const LiquidityEditor = ({
	pool,
	exchange,
	account,
	canSign,
	fresh,
}: {
	pool: AssetHubPool
	exchange: AssetHubExchange
	account: ImportedAccount | null
	canSign: boolean
	fresh: boolean
}) => {
	const { t } = useTranslation('swap')
	const balances = useStablecoinBalances(account?.address)
	const [mode, setMode] = useState<'add' | 'remove'>('add')
	const [dot, setDot] = useState('')
	const [asset, setAsset] = useState('')
	const [removePercent, setRemovePercent] = useState(100)
	const [slippage, setSlippage] = useState(50)
	const [feeAsset, setFeeAsset] = useState<AssetHubToken>('DOT')
	const [complete, setComplete] = useState(false)
	useEffect(() => {
		void balances.refresh()
	}, [account?.address])
	const dotAmount = toPlanck(dot, 10)
	const assetAmount = toPlanck(asset, 6)
	const burn = (pool.lpBalance * BigInt(removePercent)) / 100n
	let amounts: { dot: bigint; asset: bigint; lp?: bigint } | undefined
	let tx
	let error: string | undefined
	try {
		if (mode === 'add' && dotAmount > 0n && assetAmount > 0n)
			amounts = liquidityContribution(pool, dotAmount, assetAmount)
		if (mode === 'remove' && burn > 0n)
			amounts = liquidityWithdrawal(pool, burn)
		if (amounts && account && fresh && !complete)
			tx =
				mode === 'add'
					? exchange.addLiquidity(
							pool,
							dotAmount,
							assetAmount,
							account.address,
							slippage,
						)
					: exchange.removeLiquidity(pool, burn, account.address, slippage)
	} catch (caught) {
		error = messageOf(caught)
	}
	const available = (token: AssetHubToken) =>
		tokenAmount(
			maxSendableBalance(
				balances.getBalance('statemint', token),
				undefined,
				0n,
			),
			token,
		)
	const chooseMode = (value: 'add' | 'remove') => {
		setMode(value)
		setComplete(false)
	}
	return (
		<SendForm.Container className={formClasses.form}>
			<SendForm.Card>
				<PageTabs
					inline
					tabs={[
						{
							title: t('addLiquidity'),
							active: mode === 'add',
							onClick: () => chooseMode('add'),
						},
						{
							title: t('removeLiquidity'),
							active: mode === 'remove',
							onClick: () => chooseMode('remove'),
						},
					]}
				/>
				{mode === 'add' ? (
					<>
						<BalanceInputMulti
							label={t('depositDot')}
							value={dot}
							onChange={(value) => {
								setComplete(false)
								setDot(value)
								setAsset(
									tokenAmount(
										ceilDiv(
											toPlanck(value, 10) * pool.reserveAsset,
											pool.reserveDot,
										),
										pool.asset,
									),
								)
							}}
							maxAvailable={available('DOT')}
							maxDecimals={10}
							syncing={balances.loading}
							options={tokenOptions.filter((item) => item.value === 'DOT')}
							selected={tokenOptions[0]}
							onSelect={() => undefined}
						/>
						<BalanceInputMulti
							label={t('depositAsset')}
							value={asset}
							onChange={(value) => {
								setComplete(false)
								setAsset(value)
								setDot(
									tokenAmount(
										ceilDiv(
											toPlanck(value, 6) * pool.reserveDot,
											pool.reserveAsset,
										),
										'DOT',
									),
								)
							}}
							maxAvailable={available(pool.asset)}
							maxDecimals={6}
							syncing={balances.loading}
							options={tokenOptions.filter((item) => item.value === pool.asset)}
							selected={tokenOptions.find((item) => item.value === pool.asset)!}
							onSelect={() => undefined}
						/>
					</>
				) : (
					<>
						<label className={styles.setting}>
							{t('withdrawPercentage')}
							<input
								type="range"
								aria-label={t('withdrawPercentage')}
								min={1}
								max={100}
								value={removePercent}
								onChange={(event) => {
									setComplete(false)
									setRemovePercent(Number(event.target.value))
								}}
							/>
							<span>{removePercent}%</span>
						</label>
						<PageTabs
							inline
							tabs={[25, 50, 75, 100].map((value) => ({
								title: `${value}%`,
								active: removePercent === value,
								onClick: () => {
									setComplete(false)
									setRemovePercent(value)
								},
							}))}
						/>
						{pool.lpBalance === 0n && (
							<p className={classes.notice}>{t('noPositionInPool')}</p>
						)}
					</>
				)}
				{amounts && (
					<SendForm.Notes>
						<SendForm.Note
							label={t(
								mode === 'add' ? 'estimatedDeposit' : 'estimatedWithdrawal',
							)}
						>
							{tokenAmount(amounts.dot, 'DOT')} DOT +{' '}
							{tokenAmount(amounts.asset, pool.asset)} {pool.asset}
						</SendForm.Note>
						<SendForm.Note label={t('minimumAmounts')}>
							{tokenAmount(slippageLimit(amounts.dot, slippage), 'DOT')} DOT +{' '}
							{tokenAmount(slippageLimit(amounts.asset, slippage), pool.asset)}{' '}
							{pool.asset}
						</SendForm.Note>
						{mode === 'remove' && (
							<SendForm.Note label={t('withdrawalFee')}>
								{percentage(pool.withdrawalFee)}
							</SendForm.Note>
						)}
					</SendForm.Notes>
				)}
				{error && (
					<p className={classes.notice} role="alert">
						{error}
					</p>
				)}
				<SlippageField value={slippage} onChange={setSlippage} />
				<FeeField value={feeAsset} onChange={setFeeAsset} />
				<TransactionAction
					tx={tx}
					account={account}
					feeAsset={feeAsset}
					spends={
						mode === 'add' ? { DOT: dotAmount, [pool.asset]: assetAmount } : {}
					}
					valid={canSign && !!amounts && !error && fresh && !complete}
					label={t(mode === 'add' ? 'addLiquidity' : 'removeLiquidity')}
					onComplete={() => {
						setDot('')
						setAsset('')
						setComplete(true)
					}}
				/>
			</SendForm.Card>
		</SendForm.Container>
	)
}
