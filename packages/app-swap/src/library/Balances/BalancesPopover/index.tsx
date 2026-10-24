// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	getFeeTokenColor,
	getFeeTokenIcon,
	getStablecoinChainLabel,
	getStablecoinFeeAssets,
} from 'consts/stablecoins'
import { useStablecoinBalances, useTokenPrices } from 'hooks'
import { useOutsideAlerter } from 'hooks/useOutsideAlerter'
import type { Dispatch, SetStateAction } from 'react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportedAccount, StablecoinChainId } from 'types'
import { AccountDropdown } from 'ui-app/AccountDropdown'
import { Loader } from 'ui-core/base'
import {
	ConnectItem,
	Headline,
	MenuItem,
	ProportionBar,
	SegmentedBar,
} from 'ui-core/popover'
import classes from './index.module.scss'

const assetHubChains: StablecoinChainId[] = ['statemint']

const BalancePreloader = ({
	height = '1rem',
	width = '5rem',
}: {
	height?: string
	width?: string
}) => <Loader as="span" style={{ height, width }} />

export const BalancesPopover = ({
	account,
	accounts,
	onSelect,
	setOpen,
}: {
	account: ImportedAccount | null
	accounts: ImportedAccount[]
	onSelect: (account: ImportedAccount | null) => void
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { t } = useTranslation('swap')
	const { price: dotPrice } = useTokenPrices()
	const {
		getBalanceUnit,
		getStablecoinShare,
		getStablecoinTotal,
		loading: syncing,
		refresh,
	} = useStablecoinBalances(account?.address)
	useEffect(() => {
		void refresh()
	}, [refresh])
	const popoverRef = useRef<HTMLDivElement>(null)
	const [activeTab, setActiveTab] = useState<'mix' | 'balances'>('balances')
	const stablecoinTotal = getStablecoinTotal()
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
		.map((symbol) => ({
			share: getStablecoinShare({ symbol }),
			symbol,
			value: `$${getStablecoinTotal({ symbol }).toFormat(2)}`,
		}))

	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-wallet', 'wallet-account-options'])

	return (
		<div
			ref={popoverRef}
			aria-busy={syncing}
			onKeyDown={(event) => {
				if (event.key === 'Escape') setOpen(false)
			}}
		>
			<div className={classes.accountSelector}>
				<AccountDropdown
					key={`${account?.address}:${account?.source}`}
					accounts={accounts}
					initialAccount={account}
					onSelect={onSelect}
					label={t('account', { ns: 'modals' })}
					placeholder={
						accounts.length
							? t('selectAccount', { ns: 'app' })
							: t('noAccounts')
					}
					disabled={!accounts.length}
					allowCustomAccounts={false}
					dropdownClassName="wallet-account-options"
				/>
			</div>
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
				<div>
					<ConnectItem.Container>
						<h4>{t('stablecoinMix')}</h4>
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
