// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import {
	getFeeTokenColor,
	getFeeTokenIcon,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import { useStablecoinBalances } from 'hooks'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ConnectItem, Headline, MenuItem, SegmentedBar } from 'ui-core/popover'
import { BalancePreloader } from '../BalancePreloader'
import classes from './index.module.scss'

export const StablecoinMix = ({
	account,
}: {
	account: ImportedAccount | null
}) => {
	const { t } = useTranslation('modals')
	const { getBalanceUnit, loading: syncing } = useStablecoinBalances(
		account?.address,
	)
	const stablecoins = getStablecoinFeeAssets('statemint')
		.filter((symbol) => symbol !== 'DOT')
		.map((symbol) => ({
			symbol,
			value: getBalanceUnit('statemint', symbol),
		}))
	const total = stablecoins.reduce(
		(sum, { value }) => sum.plus(value),
		new BigNumber(0),
	)
	const mix = stablecoins
		.map(({ symbol, value }) => ({
			symbol,
			share: total.isZero()
				? 0
				: value.dividedBy(total).multipliedBy(100).decimalPlaces(2).toNumber(),
			hasBalance: !value.isZero(),
		}))
		.sort((a, b) => Number(b.hasBalance) - Number(a.hasBalance))
	const mixIcons = mix.filter(({ hasBalance }) => hasBalance)

	return (
		<div className={classes.mix}>
			<Headline
				title={t('stablecoinMix')}
				value={
					<span className={classes.mixIcons} aria-hidden>
						{mixIcons.map(({ symbol }) => (
							<img key={symbol} src={getFeeTokenIcon(symbol)} alt="" />
						))}
					</span>
				}
			/>
			<ConnectItem.Container>
				<MenuItem padded>
					{syncing ? (
						<BalancePreloader height="0.72rem" width="100%" />
					) : (
						<SegmentedBar
							ariaLabel={mix
								.map(({ share, symbol }) => `${symbol}: ${share}%`)
								.join(', ')}
							segments={mix.map(({ share, symbol }) => ({
								color: getFeeTokenColor(symbol),
								id: symbol,
								value: share,
							}))}
						/>
					)}
				</MenuItem>
				{mix.map(({ symbol, share }) => (
					<MenuItem key={symbol} padded>
						<div>
							<img src={getFeeTokenIcon(symbol)} alt="" />
						</div>
						<div>
							<h3>{symbol}</h3>
							<div>{syncing ? <BalancePreloader /> : <h4>{share}%</h4>}</div>
						</div>
					</MenuItem>
				))}
			</ConnectItem.Container>
		</div>
	)
}
