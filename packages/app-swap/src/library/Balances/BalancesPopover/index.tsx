// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getFeeTokenColor,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import { useStablecoinBalances, useTokenPrices } from 'hooks'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { Loader } from 'ui-core/base'
import { ConnectItem, Headline, MenuItem, SegmentedBar } from 'ui-core/popover'
import classes from './index.module.scss'

const BalancePreloader = ({
	height = '1rem',
	width = '5rem',
}: {
	height?: string
	width?: string
}) => <Loader as="span" style={{ height, width }} />

export const BalancesView = ({
	account,
}: {
	account: ImportedAccount | null
}) => {
	const { t } = useTranslation('swap')
	const { price: dotPrice } = useTokenPrices()
	const {
		getBalanceUnit,
		loading: syncing,
		refresh,
	} = useStablecoinBalances(account?.address)
	useEffect(() => {
		void refresh()
	}, [refresh])
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')
	const assets = getStablecoinFeeAssets('statemint').map((symbol) => ({
		symbol,
		value: getBalanceUnit('statemint', symbol),
	}))
	const stablecoins = assets.filter(({ symbol }) => symbol !== 'DOT')
	const dotTotal = getBalanceUnit('statemint', 'DOT')
	const stablecoinTotal = stablecoins.reduce(
		(sum, { value }) => sum.plus(value),
		dotTotal.multipliedBy(0),
	)
	const total = stablecoinTotal.plus(dotTotal.multipliedBy(dotPrice))
	const totalUnavailable = !dotTotal.isZero() && dotPrice === 0
	const stablecoinMix = stablecoins
		.map(({ symbol, value }) => ({
			symbol,
			share: stablecoinTotal.isZero()
				? 0
				: value
						.dividedBy(stablecoinTotal)
						.multipliedBy(100)
						.decimalPlaces(2)
						.toNumber(),
			hasBalance: !value.isZero(),
		}))
		.sort((a, b) => Number(b.hasBalance) - Number(a.hasBalance))
	const mixIcons = stablecoinMix.filter(({ hasBalance }) => hasBalance)
	const showMix = activeTab === 'mix'
	const rows = showMix
		? stablecoinMix.map(({ symbol, share }) => ({ symbol, value: `${share}%` }))
		: assets
				.sort((a, b) => b.value.comparedTo(a.value) ?? 0)
				.map(({ symbol, value }) => ({ symbol, value: value.toFormat(2) }))

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
				{(['balances', 'mix'] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						className={classes.tab}
						aria-pressed={activeTab === tab}
						onClick={() => setActiveTab(tab)}
					>
						{t(tab)}
					</button>
				))}
			</div>

			<div className={showMix ? classes.mix : undefined}>
				<Headline
					title={t(showMix ? 'stablecoinMix' : 'balance')}
					value={
						showMix ? (
							<span className={classes.mixIcons} aria-hidden>
								{mixIcons.map(({ symbol }) => (
									<img key={symbol} src={getFeeTokenIcon(symbol)} alt="" />
								))}
							</span>
						) : syncing ? (
							<BalancePreloader height="1.5rem" width="7.5rem" />
						) : totalUnavailable ? (
							'—'
						) : (
							`$${total.toFormat(2)}`
						)
					}
				/>
				<ConnectItem.Container>
					{showMix ? (
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
					) : (
						<h4>{getStablecoinChainLabel('statemint')}</h4>
					)}
					{rows.map(({ symbol, value }) => (
						<MenuItem key={symbol} padded>
							<div>
								<img src={getFeeTokenIcon(symbol)} alt="" />
							</div>
							<div>
								<h3>{symbol}</h3>
								<div>{syncing ? <BalancePreloader /> : <h4>{value}</h4>}</div>
							</div>
						</MenuItem>
					))}
				</ConnectItem.Container>
			</div>
		</div>
	)
}
