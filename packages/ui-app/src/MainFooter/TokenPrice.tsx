// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { useTokenPrices } from 'hooks/useTokenPrices'
import { useMemo } from 'react'
import classes from './index.module.scss'

export const TokenPrice = () => {
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { price, change } = useTokenPrices()
	const { unit } = getStakingChainData(network)
	const priceFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency,
			}),
		[currency],
	)
	return (
		<>
			<div className={classes.stat}>
				1 {unit} / {priceFormatter.format(price)}
			</div>
			<div className={classes.stat}>
				<span
					className={change < 0 ? classes.neg : change > 0 ? classes.pos : ''}
				>
					{change < 0 ? '' : change > 0 ? '+' : ''}
					{change}%
				</span>
			</div>
		</>
	)
}
