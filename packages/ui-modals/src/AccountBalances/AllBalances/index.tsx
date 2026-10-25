// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getFeeTokenIcon,
	getStablecoinChainLabel,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import { useStablecoinBalances, useTokenPrices } from 'hooks'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount } from 'types'
import { ConnectItem, Headline, MenuItem } from 'ui-core/popover'
import { BalancePreloader } from '../BalancePreloader'

export const AllBalances = ({ account }: { account: ImportedAccount }) => {
	const { t } = useTranslation('modals')
	const { price: dotPrice } = useTokenPrices()
	const { getBalanceUnit, loading: syncing } = useStablecoinBalances(
		account.address,
	)
	const assets = getStablecoinFeeAssets('statemint').map((symbol) => ({
		symbol,
		value: getBalanceUnit('statemint', symbol),
	}))
	const dotTotal = getBalanceUnit('statemint', 'DOT')

	const total = assets
		.filter(({ symbol }) => symbol !== 'DOT')
		.reduce(
			(sum, { value }) => sum.plus(value),
			dotTotal.multipliedBy(dotPrice),
		)
	const totalUnavailable = !dotTotal.isZero() && dotPrice === 0
	const rows = assets.sort((a, b) => b.value.comparedTo(a.value) ?? 0)

	return (
		<>
			<Headline
				title={t('balance')}
				value={
					syncing ? (
						<BalancePreloader height="1.5rem" width="7.5rem" />
					) : totalUnavailable ? (
						'—'
					) : (
						`$${total.toFormat(2)}`
					)
				}
			/>
			<ConnectItem.Container>
				<h4>{getStablecoinChainLabel('statemint')}</h4>
				{rows.map(({ symbol, value }) => (
					<MenuItem key={symbol} padded>
						<div>
							<img src={getFeeTokenIcon(symbol)} alt="" />
						</div>
						<div>
							<h3>{symbol}</h3>
							<div>
								{syncing ? <BalancePreloader /> : <h4>{value.toFormat(2)}</h4>}
							</div>
						</div>
					</MenuItem>
				))}
			</ConnectItem.Container>
		</>
	)
}
