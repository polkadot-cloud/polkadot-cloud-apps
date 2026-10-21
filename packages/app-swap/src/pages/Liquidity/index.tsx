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
	AccountField,
	FeeField,
	formatUnits,
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
import type {
	AssetHubExchange,
	AssetHubPool,
	AssetHubPoolToken,
	AssetHubToken,
	ImportedAccount,
} from 'types'
import { BalanceInputMulti } from 'ui-app/BalanceInput'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import formClasses from '../Send/Send.module.scss'
import { maxSendableBalance, toPlanck } from '../Send/utils'

export const Liquidity = () => {
	const { t } = useTranslation('swap')
	const accounts = useSendAccounts()
	const now = useNow()
	const account = accounts.fromAccount
	const { market, exchange, error, refresh } = useAssetHubMarket(
		account?.address,
	)
	const [tab, setTab] = useState<'pools' | 'positions'>('pools')
	const [selected, setSelected] = useState<AssetHubPoolToken>()
	const pool = market?.pools.find((item) => item.asset === selected)
	const shown = market?.pools.filter(
		(item) => tab === 'pools' || item.lpBalance > 0n,
	)
	return (
		<Page.Row>
			<div className={styles.layout}>
				<SendForm.Header
					title={t('liquidity')}
					subtitle={t('liquidityDescription')}
				/>
				<AccountField
					account={account}
					accounts={accounts.accountsWithSigners}
					onSelect={accounts.setFromAccount}
				/>
				<fieldset className={styles.tabs} aria-label={t('liquidity')}>
					<button
						type="button"
						className={styles.button}
						aria-pressed={tab === 'pools'}
						onClick={() => setTab('pools')}
					>
						{t('pools')}
					</button>
					<button
						type="button"
						className={styles.button}
						aria-pressed={tab === 'positions'}
						onClick={() => setTab('positions')}
					>
						{t('yourPositions')}
					</button>
					<button type="button" className={styles.button} onClick={refresh}>
						{t('refresh')}
					</button>
				</fieldset>
				{error && (
					<p className={styles.notice} role="alert">
						{error}
					</p>
				)}
				{!market && !error && (
					<p className={styles.notice} role="status">
						{t('loadingPools')}
					</p>
				)}
				{tab === 'positions' && !account && (
					<p className={styles.notice}>{t('selectAccountForPositions')}</p>
				)}
				{market && (
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th scope="col">{t('pool')}</th>
									<th scope="col">{t('reserves')}</th>
									<th scope="col">{t('swapFee')}</th>
									<th scope="col">{t('yourShare')}</th>
									<th scope="col">{t('manage')}</th>
								</tr>
							</thead>
							<tbody>
								{shown?.map((item) => (
									<tr key={item.asset}>
										<td>
											DOT / {item.asset}
											<small>
												{t('lpToken')} #{item.lpToken}
											</small>
										</td>
										<td>
											{tokenAmount(item.reserveDot, 'DOT')} DOT
											<small>
												{tokenAmount(item.reserveAsset, item.asset)}{' '}
												{item.asset}
											</small>
										</td>
										<td>{percentage(item.fee)}</td>
										<td>
											{account && item.lpSupply > 0n
												? `${formatUnits((item.lpBalance * 1_000_000n) / item.lpSupply, 4)}%`
												: '—'}
											{item.lpBalance > 0n && (
												<small>
													{tokenAmount(
														(item.lpBalance * item.reserveAsset) /
															item.lpSupply,
														item.asset,
													)}{' '}
													{item.asset} +{' '}
													{tokenAmount(
														(item.lpBalance * item.reserveDot) / item.lpSupply,
														'DOT',
													)}{' '}
													DOT
												</small>
											)}
										</td>
										<td>
											<button
												type="button"
												className={styles.button}
												aria-pressed={selected === item.asset}
												onClick={() => setSelected(item.asset)}
											>
												{t('manage')}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{shown?.length === 0 && (
							<p className={styles.notice}>
								{t(tab === 'positions' ? 'noPositions' : 'noPools')}
							</p>
						)}
					</div>
				)}
				{pool && exchange && (
					<LiquidityEditor
						key={`${pool.asset}:${account?.address}:${account?.source}`}
						pool={pool}
						exchange={exchange}
						account={account}
						fresh={!!market && now - market.fetchedAt < 30_000}
						refresh={refresh}
					/>
				)}
			</div>
		</Page.Row>
	)
}

const LiquidityEditor = ({
	pool,
	exchange,
	account,
	fresh,
	refresh,
}: {
	pool: AssetHubPool
	exchange: AssetHubExchange
	account: ImportedAccount | null
	fresh: boolean
	refresh: () => void
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
			<SendForm.Header
				title={`DOT / ${pool.asset}`}
				subtitle={t('manageLiquidity')}
			/>
			<SendForm.Card>
				<fieldset className={styles.tabs} aria-label={t('manageLiquidity')}>
					<button
						type="button"
						className={styles.button}
						aria-pressed={mode === 'add'}
						onClick={() => chooseMode('add')}
					>
						{t('addLiquidity')}
					</button>
					<button
						type="button"
						className={styles.button}
						aria-pressed={mode === 'remove'}
						onClick={() => chooseMode('remove')}
					>
						{t('removeLiquidity')}
					</button>
				</fieldset>
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
						<div className={styles.tabs}>
							{[25, 50, 75, 100].map((value) => (
								<button
									key={value}
									type="button"
									className={styles.button}
									aria-pressed={removePercent === value}
									onClick={() => {
										setComplete(false)
										setRemovePercent(value)
									}}
								>
									{value}%
								</button>
							))}
						</div>
						{pool.lpBalance === 0n && (
							<p className={styles.notice}>{t('noPositionInPool')}</p>
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
					<p className={styles.notice} role="alert">
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
					valid={!!amounts && !error && fresh && !complete}
					label={t(mode === 'add' ? 'addLiquidity' : 'removeLiquidity')}
					onComplete={() => {
						setDot('')
						setAsset('')
						setComplete(true)
						refresh()
					}}
				/>
			</SendForm.Card>
		</SendForm.Container>
	)
}
