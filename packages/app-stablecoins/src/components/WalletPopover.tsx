// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOutsideAlerter } from '@w3ux/hooks'
import dotSvg from 'assets/token/dot.svg'
import hdxSvg from 'assets/token/hdx.svg'
import hollarSvg from 'assets/token/hollar.svg'
import usdcSvg from 'assets/token/usdc.svg'
import usdtSvg from 'assets/token/usdt.svg'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { PopoverTab } from 'ui-buttons'
import { ConnectItem } from 'ui-core/popover'
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
	{ chain: 'Polkadot Hub', value: '$935,200.00', share: 79 },
	{ chain: 'Hydration', value: '$255,540.00', share: 21 },
]

const chainTokenBreakdown = [
	{
		chain: 'Polkadot Hub',
		total: '$935,200.00',
		tokens: [
			{ icon: usdcSvg, name: 'USDC', value: '750,000.00' },
			{ icon: usdtSvg, name: 'USDT', value: '185,200.00' },
			{ icon: dotSvg, name: 'DOT', value: '31,696.00' },
		],
	},
	{
		chain: 'Hydration',
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
					<h3 className={classes.sectionTitle}>Stablecoin Mix</h3>
					<div className={classes.mixBar}>
						{stablecoinMix.map((coin) => (
							<div
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
					</div>
					<div className={classes.mixLegend}>
						{stablecoinMix.map((coin) => (
							<div key={coin.label} className={classes.mixLegendItem}>
								<div className={classes.mixLegendLabel}>
									<img
										src={coin.icon}
										alt={coin.label}
										className={classes.mixLegendIcon}
									/>
									<span>{coin.label}</span>
								</div>
								<span className={classes.mixLegendValue}>{coin.value}</span>
							</div>
						))}
					</div>

					<div className={classes.subSection}>
						<h3 className={classes.sectionTitle}>Balances by Chain</h3>
						<div className={classes.chainTable}>
							<div
								className={`${classes.chainTableRow} ${classes.chainTableHead}`}
							>
								<span className={classes.chainCell}>Chain</span>
								<span className={classes.valueCell}>Balance</span>
								<span className={classes.shareCell}>Share</span>
							</div>
							{chainBalances.map((row) => (
								<div key={row.chain} className={classes.chainTableRow}>
									<span className={classes.chainCell}>{row.chain}</span>
									<span className={classes.valueCell}>{row.value}</span>
									<div className={classes.shareCell}>
										<span className={classes.shareValue}>{row.share}%</span>
										<div className={classes.chainTrack}>
											<div
												className={classes.chainFill}
												style={{ width: `${row.share}%` }}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
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
							<>
								<h4>{group.chain}</h4>
								<div key={group.chain} className={classes.breakdownGroup}>
									<div className={classes.breakdownHeader}>
										<span className={classes.breakdownTotal}>
											{group.total}
										</span>
									</div>
									<div className={classes.tokenList}>
										{group.tokens.map((token) => (
											<div
												key={`${group.chain}-${token.name}`}
												className={classes.tokenRow}
											>
												<div className={classes.tokenLabel}>
													<img
														src={token.icon}
														alt={token.name}
														className={classes.tokenIcon}
													/>
													<span>{token.name}</span>
												</div>
												<span className={classes.tokenValue}>
													{token.value}
												</span>
											</div>
										))}
									</div>
								</div>
							</>
						))}
					</ConnectItem.Container>
				</div>
			)}
		</div>
	)
}
