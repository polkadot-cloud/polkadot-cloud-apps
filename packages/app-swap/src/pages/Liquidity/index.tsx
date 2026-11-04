// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { AssetHubPoolTokens } from 'consts/assetHub'
import { useQuoteExpired } from 'hooks/useQuoteExpired'
import { AccountField, useAssetHubMarket } from 'library/AssetHub'
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
import { useSendAccounts } from '../Send/hooks/useSendAccounts'
import classes from './index.module.scss'
import { LiquidityEditor } from './LiquidityEditor'
import { PoolList } from './PoolList'

export const Liquidity = () => {
	const { t } = useTranslation('swap')
	const accounts = useSendAccounts()
	const account = accounts.fromAccount
	const { market, exchange, error } = useAssetHubMarket(account?.address)
	const expired = useQuoteExpired(market?.fetchedAt)
	const { asset } = useParams<{ asset: string }>()
	const { search } = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const tab = searchParams.get('tab') === 'positions' ? 'positions' : 'pools'
	const selected = AssetHubPoolTokens.find((token) => token === asset)
	const pool = market?.pools.find((item) => item.asset === selected)

	if (asset && !selected) return <Navigate to={`/liquidity${search}`} replace />

	return (
		<Page.Row>
			<div
				className={classNames(classes.layout, selected && classes.poolScreen)}
			>
				{selected && (
					<nav className={classes.breadcrumb} aria-label={t('liquidity')}>
						<ol>
							<li>
								<Link to={`/liquidity${search}`}>{t('liquidity')}</Link>
							</li>
							<li aria-hidden="true">›</li>
							<li aria-current="page">DOT / {selected}</li>
						</ol>
					</nav>
				)}
				<SendForm.Header
					title={selected ? `DOT / ${selected}` : t('liquidity')}
					subtitle={t(selected ? 'manageLiquidity' : 'liquidityDescription')}
				/>
				<AccountField
					account={account}
					accounts={accounts.accountsWithSigners}
					onSelect={accounts.setFromAccount}
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
