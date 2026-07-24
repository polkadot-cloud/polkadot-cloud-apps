// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useOutsideAlerter } from '@w3ux/hooks'
import {
	getFeeTokenColor,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	getStablecoinFeeAssets,
	StablecoinChains,
	StablecoinSymbols,
} from 'consts/stablecoins'
import { useStablecoinBalances } from 'hooks'
import type { Dispatch, SetStateAction } from 'react'
import { Fragment, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { Loader } from 'ui-core/base'
import {
	ConnectItem,
	Headline,
	MenuItem,
	ProportionBar,
	SegmentedBar,
} from 'ui-core/popover'

const BalancePreloader = ({
	height = '1rem',
	width = '5rem',
}: {
	height?: string
	width?: string
}) => <Loader as="span" style={{ height, width }} />

export const WalletPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { t } = useTranslation('app')
	const { activeAddress } = useActiveAccount()
	const {
		getBalanceUnit,
		getStablecoinShare,
		getStablecoinTotal,
		loading: syncing,
	} = useStablecoinBalances(activeAddress)
	const popoverRef = useRef<HTMLDivElement>(null)
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')
	const stablecoinMix = StablecoinSymbols.map((symbol) => ({
		share: getStablecoinShare({ symbol }),
		symbol,
		value: `$${getStablecoinTotal({ symbol }).toFormat(2)}`,
	}))

	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-wallet'])

	return (
		<div ref={popoverRef} aria-busy={syncing}>
			{syncing && (
				<span
					aria-label={t('stablecoins.syncingBalances')}
					aria-live="polite"
					role="status"
				/>
			)}
			<PopoverTab.Container position="top">
				<PopoverTab.Button
					text={t('stablecoins.balances')}
					onClick={() => setActiveTab('balances')}
				/>
				<PopoverTab.Button
					text={t('stablecoins.mix')}
					onClick={() => setActiveTab('mix')}
				/>
			</PopoverTab.Container>

			{activeTab === 'mix' && (
				<div>
					<ConnectItem.Container>
						<h4>{t('stablecoins.stablecoinMix')}</h4>
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
						{stablecoinMix.map(({ symbol, value }) => (
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

						{StablecoinChains.map((chain) => (
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
												percentage={getStablecoinShare({ chain })}
											/>
										)}
									</div>
								</MenuItem>
							</Fragment>
						))}
					</ConnectItem.Container>
				</div>
			)}

			{activeTab === 'balances' && (
				<div>
					<Headline
						title={t('stablecoins.balance')}
						value={
							syncing ? (
								<BalancePreloader height="1.5rem" width="7.5rem" />
							) : (
								`$${getStablecoinTotal().toFormat(2)}`
							)
						}
					/>

					<ConnectItem.Container>
						{StablecoinChains.map((chain) => (
							<Fragment key={chain}>
								<h4>{getStablecoinChainLabel(chain)}</h4>
								<MenuItem padded>
									<div>
										<h3>{t('stablecoins.total')}</h3>
										<div>
											{syncing ? (
												<BalancePreloader width="7rem" />
											) : (
												<h4>${getStablecoinTotal({ chain }).toFormat(2)}</h4>
											)}
										</div>
									</div>
								</MenuItem>
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
