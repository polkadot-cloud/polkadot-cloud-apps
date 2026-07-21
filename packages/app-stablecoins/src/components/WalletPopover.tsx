// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOutsideAlerter } from '@w3ux/hooks'
import dotSvg from 'assets/token/dot.svg'
import hdxSvg from 'assets/token/hdx.svg'
import hollarSvg from 'assets/token/hollar.svg'
import usdcSvg from 'assets/token/usdc.svg'
import usdtSvg from 'assets/token/usdt.svg'
import { StablecoinConfigs } from 'consts/stablecoins'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import { Fragment, useRef, useState } from 'react'
import { PopoverTab } from 'ui-buttons'
import { ConnectItem, MenuItem } from 'ui-core/popover'
import classes from './WalletPopover.module.scss'

const stablecoinMix = [
	{
		icon: usdcSvg,
		label: 'USDC',
		value: '$750,000',
		share: 60,
		color: '#3E73C4',
	},
	{
		icon: usdtSvg,
		label: 'USDT',
		value: '$312,450',
		share: 27,
		color: '#26A17B',
	},
	{
		icon: hollarSvg,
		label: 'HOLLAR',
		value: '$150,000',
		share: 13,
		color: '#B3CF92',
	},
]

const chainBalances = [
	{
		chain: StablecoinConfigs.statemint.label,
		value: '$935,200.00',
		share: 79,
	},
	{
		chain: StablecoinConfigs.hydration.label,
		value: '$255,540.00',
		share: 21,
	},
]

const chainTokenBreakdown = [
	{
		chain: StablecoinConfigs.statemint.label,
		total: '$935,200.00',
		tokens: [
			{ icon: usdcSvg, name: 'USDC', value: '750,000.00' },
			{ icon: usdtSvg, name: 'USDT', value: '185,200.00' },
			{ icon: dotSvg, name: 'DOT', value: '31,696.00' },
		],
	},
	{
		chain: StablecoinConfigs.hydration.label,
		total: '$255,540.00',
		tokens: [
			{ icon: usdcSvg, name: 'USDC', value: '92,500.00' },
			{ icon: usdtSvg, name: 'USDT', value: '312,450.00' },
			{ icon: hollarSvg, name: 'HOLLAR', value: '150,000.00' },
			{ icon: hdxSvg, name: 'HDX', value: '820,000.00' },
			{ icon: dotSvg, name: 'DOT', value: '13,584.00' },
		],
	},
]

export const WalletPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const popoverRef = useRef<HTMLDivElement>(null)
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')

	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-wallet'])

	return (
		<div ref={popoverRef}>
			<PopoverTab.Container position="top">
				<PopoverTab.Button
					text="Balances"
					onClick={() => setActiveTab('balances')}
				/>
				<PopoverTab.Button text="Mix" onClick={() => setActiveTab('mix')} />
			</PopoverTab.Container>

			{activeTab === 'mix' && (
				<div className={classes.section}>
					<ConnectItem.Container>
						<h4>Stablecoin Mix</h4>
						<MenuItem padded>
							<span className={classes.mixBar}>
								{stablecoinMix.map((coin) => (
									<span
										key={coin.label}
										className={classes.mixSegment}
										style={
											{
												width: `${coin.share}%`,
												'--mix-color': coin.color,
											} as CSSProperties
										}
									/>
								))}
							</span>
						</MenuItem>
						{stablecoinMix.map((coin) => (
							<MenuItem key={coin.label} padded>
								<div>
									<img
										src={coin.icon}
										alt={coin.label}
										className={classes.tokenIcon}
									/>
								</div>
								<div>
									<h3>{coin.label}</h3>
									<div>
										<h4>{coin.value}</h4>
									</div>
								</div>
							</MenuItem>
						))}

						{chainBalances.map((row) => (
							<Fragment key={row.chain}>
								<h4>{row.chain}</h4>
								<MenuItem padded>
									<div>
										<h3>{row.value}</h3>
									</div>
									<div>
										<div className={classes.shareCell}>
											<h4>{row.share}%</h4>
											<div className={classes.chainTrack}>
												<div
													className={classes.chainFill}
													style={{ width: `${row.share}%` }}
												/>
											</div>
										</div>
									</div>
								</MenuItem>
							</Fragment>
						))}
					</ConnectItem.Container>
				</div>
			)}

			{activeTab === 'balances' && (
				<div className={classes.section}>
					<div className={classes.header}>
						<h2 className={classes.title}>Wallet</h2>
						<span className={classes.balance}>$1,190,740.00</span>
					</div>

					<ConnectItem.Container>
						{chainTokenBreakdown.map((group) => (
							<Fragment key={group.chain}>
								<h4>{group.chain}</h4>
								<MenuItem padded>
									<div>
										<h3>Total</h3>
										<div>
											<h4>{group.total}</h4>
										</div>
									</div>
								</MenuItem>
								{group.tokens.map((token) => (
									<MenuItem key={`${group.chain}-${token.name}`} padded>
										<div>
											<img
												src={token.icon}
												alt={token.name}
												className={classes.tokenIcon}
											/>
										</div>
										<div>
											<h3>{token.name}</h3>
											<div>
												<h4>{token.value}</h4>
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
