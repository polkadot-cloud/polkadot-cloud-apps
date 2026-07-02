// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { useTokenPrices } from 'hooks/useTokenPrices'
import { formatFiatCurrency } from 'locales/util'

export const TokenPrice = () => {
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { price, change } = useTokenPrices()
	const { unit } = getStakingChainData(network)
	return (
		<>
			<div className="stat">
				1 {unit} / {formatFiatCurrency(price, currency)}
			</div>
			<div className="stat">
				<span
					className={`change${change < 0 ? ' neg' : change > 0 ? ' pos' : ''}`}
				>
					{change < 0 ? '' : change > 0 ? '+' : ''}
					{change.toFixed(2)}%
				</span>
			</div>
		</>
	)
}
