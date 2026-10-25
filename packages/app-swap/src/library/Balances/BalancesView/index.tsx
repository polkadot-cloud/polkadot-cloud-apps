// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getFeeTokenColor,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import { useStablecoinBalances, useTokenPrices } from 'hooks'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount, StablecoinChainId } from 'types'
import { Loader } from 'ui-core/base'
import { ConnectItem, Headline, MenuItem, SegmentedBar } from 'ui-core/popover'
import classes from './index.module.scss'

const assetHubChains: StablecoinChainId[] = ['statemint']

const BalancePreloader = ({
	height = '1rem',
	width = '5rem',
}: {
	height?: string
	width?: string
}) => <Loader as="span" style={{ height, width }} />

export const BalancesView = ({
	account,
	hideTotal = false,
}: {
	account: ImportedAccount | null
	hideTotal?: boolean
}) => {
	const { t } = useTranslation('swap')
	const { price: dotPrice } = useTokenPrices()
	const {
		getBalanceUnit,
		getStablecoinTotal,
		loading: syncing,
		refresh,
	} = useStablecoinBalances(account?.address)
	useEffect(() => {
		void refresh()
	}, [refresh])
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')
	const stablecoinTotal = getStablecoinTotal({ chain: 'statemint' })
	const dotTotal = assetHubChains.reduce(
		(total, chain) => total.plus(getBalanceUnit(chain, 'DOT')),
		stablecoinTotal.multipliedBy(0),
	)
	const getDotTotal = (chain?: StablecoinChainId) =>
		chain ? getBalanceUnit(chain, 'DOT') : dotTotal
	const getTotalBalance = (chain?: StablecoinChainId) =>
		(chain ? getStablecoinTotal({ chain }) : stablecoinTotal).plus(
			getDotTotal(chain).multipliedBy(dotPrice),
		)
	const isTotalBalanceUnavailable = (chain?: StablecoinChainId) =>
		!getDotTotal(chain).isZero() && dotPrice === 0
	const stablecoinMix = getStablecoinFeeAssets('statemint')
		.filter((symbol) => symbol !== 'DOT')
		.map((symbol) => {
			const value = getStablecoinTotal({ chain: 'statemint', symbol })
			return {
				share: stablecoinTotal.isZero()
					? 0
					: value
							.dividedBy(stablecoinTotal)
							.multipliedBy(100)
							.decimalPlaces(2)
							.toNumber(),
				symbol,
				hasBalance: !value.isZero(),
			}
		})
		.sort((a, b) => Number(b.hasBalance) - Number(a.hasBalance))
	const mixIcons = stablecoinMix.filter(({ hasBalance }) => hasBalance)

	return (
		<div className={classes.balancesView} aria-busy={syncing}>
			{syncing && (
				<span
					aria-label={t('syncingBalances')}
					aria-live="polite"
					role="status"
				/>
			)}
			<div className={classes.tabs}>
				<button
					type="button"
					className={classes.tab}
					aria-pressed={activeTab === 'balances'}
					onClick={() => setActiveTab('balances')}
				>
					{t('balances')}
				</button>
				<button
					type="button"
					className={classes.tab}
					aria-pressed={activeTab === 'mix'}
					onClick={() => setActiveTab('mix')}
				>
					{t('mix')}
				</button>
			</div>

			{activeTab === 'mix' && (
				<div className={classes.mix}>
					<Headline
						title={t('stablecoinMix')}
						value={
							mixIcons.length > 0 ? (
								<span className={classes.mixIcons} aria-hidden="true">
									{mixIcons.map(({ symbol }) => (
										<img key={symbol} src={getFeeTokenIcon(symbol)} alt="" />
									))}
								</span>
							) : null
						}
					/>
					<ConnectItem.Container>
						<MenuItem padded>
							{syncing ? (
								<BalancePreloader height="0.72rem" width="100%" />
							) : (
								<SegmentedBar
									ariaLabel={stablecoinMix
										.map(({ share, symbol }) => `${symbol}: ${share}%`)
										.join(', ')}
									segments={stablecoinMix.map(({ share, symbol }) => ({
										color: getFeeTokenColor(symbol),
										id: symbol,
										value: share,
									}))}
								/>
							)}
						</MenuItem>
						{stablecoinMix.map(({ symbol, share }) => (
							<MenuItem key={symbol} padded>
								<div>
									<img src={getFeeTokenIcon(symbol)} alt="" />
								</div>
								<div>
									<h3>{symbol}</h3>
									<div>
										{syncing ? <BalancePreloader /> : <h4>{share}%</h4>}
									</div>
								</div>
							</MenuItem>
						))}

						{/* Restore the chain breakdown when more than Polkadot Hub is supported.
						{assetHubChains.map((chain) => (
							<Fragment key={chain}>
								<h4>{getStablecoinChainLabel(chain)}</h4>
								<MenuItem padded>
									<div>
										{syncing ? (
											<BalancePreloader height="1.2rem" width="7rem" />
										) : (
											<h3>${getStablecoinTotal({ chain }).toFormat(2)}</h3>
										)}
									</div>
									<div>
										{syncing ? (
											<BalancePreloader height="0.75rem" width="7rem" />
										) : (
											<ProportionBar
												percentage={stablecoinTotal.isZero() ? 0 : 100}
											/>
										)}
									</div>
								</MenuItem>
							</Fragment>
						))}
						*/}
					</ConnectItem.Container>
				</div>
			)}

			{activeTab === 'balances' && (
				<div>
					<Headline
						title={t('balance')}
						value={
							syncing ? (
								<BalancePreloader height="1.5rem" width="7.5rem" />
							) : isTotalBalanceUnavailable() ? (
								<>&mdash;</>
							) : (
								`$${getTotalBalance().toFormat(2)}`
							)
						}
					/>

					<ConnectItem.Container>
						{assetHubChains.map((chain) => (
							<Fragment key={chain}>
								<h4>{getStablecoinChainLabel(chain)}</h4>
								{!hideTotal && (
									<MenuItem padded>
										<div>
											<h3>{t('total')}</h3>
											<div>
												{syncing ? (
													<BalancePreloader width="7rem" />
												) : isTotalBalanceUnavailable(chain) ? (
													<h4>&mdash;</h4>
												) : (
													<h4>${getTotalBalance(chain).toFormat(2)}</h4>
												)}
											</div>
										</div>
									</MenuItem>
								)}
								{getStablecoinFeeAssets(chain).map((symbol) => (
									<MenuItem key={`${chain}-${symbol}`} padded>
										<div>
											<img src={getFeeTokenIcon(symbol)} alt="" />
										</div>
										<div>
											<h3>{symbol}</h3>
											<div>
												{syncing ? (
													<BalancePreloader />
												) : (
													<h4>{getBalanceUnit(chain, symbol).toFormat(2)}</h4>
												)}
											</div>
										</div>
									</MenuItem>
								))}
							</Fragment>
						))}
					</ConnectItem.Container>
				</div>
			)}
		</div>
	)
}
