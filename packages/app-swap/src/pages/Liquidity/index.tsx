// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { AssetHubPoolTokens } from 'consts/assetHub'
import { useQuoteExpired } from 'hooks/useQuoteExpired'
import { useAssetHubMarket } from 'library/AssetHub'
import { useTranslation } from 'react-i18next'
import {
	Link,
	Navigate,
	useLocation,
	useParams,
	useSearchParams,
} from 'react-router-dom'
import { Page } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import { ExchangeNotice } from '../../library/ExchangeNotice'
import classes from './index.module.scss'
import { LiquidityEditor } from './LiquidityEditor'
import { PoolList } from './PoolList'

export const Liquidity = () => {
	const { t } = useTranslation('swap')
	const { activeAccount } = useActiveAccount()
	const { getAccount, accountHasSigner } = useImportedAccounts()
	const account = getAccount(activeAccount)
	const { market, exchange, error } = useAssetHubMarket(account?.address)
	const expired = useQuoteExpired(market?.fetchedAt)
	const { asset } = useParams<{ asset: string }>()
	const { search } = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const tab = searchParams.get('tab') === 'positions' ? 'positions' : 'pools'
	const selected = AssetHubPoolTokens.find((token) => token === asset)
	const pool = market?.pools.find((item) => item.asset === selected)

	if (asset && !selected) return <Navigate to={`/liquidity${search}`} replace />

	const liquidityLabel = t('liquidity')
	const title = selected ? `DOT / ${selected}` : liquidityLabel

	return (
		<Page.Row>
			<div className={classes.layout}>
				<nav className={classes.breadcrumb} aria-label={liquidityLabel}>
					<ol>
						{selected && (
							<>
								<li>
									<Link to={`/liquidity${search}`}>{liquidityLabel}</Link>
								</li>
								<li aria-hidden="true">›</li>
							</>
						)}
						<li aria-current="page">{title}</li>
					</ol>
				</nav>
				<SendForm.Header
					title={title}
					subtitle={
						selected
							? t('manageLiquidity', { pair: title })
							: t('liquidityDescription')
					}
				/>
				{error && <ExchangeNotice status="danger">{error}</ExchangeNotice>}
				{!market && !error && (
					<p className={classes.notice} role="status">
						{t('loadingPools')}
					</p>
				)}
				{selected ? (
					pool && exchange ? (
						<LiquidityEditor
							key={`${pool.asset}:${account?.address}:${account?.source}`}
							pool={pool}
							exchange={exchange}
							account={account}
							canSign={accountHasSigner(activeAccount)}
							fresh={!!market && !expired}
						/>
					) : (
						market && <p className={classes.notice}>{t('noPools')}</p>
					)
				) : (
					<PoolList
						pools={market?.pools}
						account={account}
						tab={tab}
						onTabChange={(value) => {
							setSearchParams(
								(previous) => {
									const next = new URLSearchParams(previous)
									next.set('tab', value)
									return next
								},
								{ replace: true },
							)
						}}
					/>
				)}
			</div>
		</Page.Row>
	)
}
