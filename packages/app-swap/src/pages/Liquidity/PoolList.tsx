// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { formatUnits, percentage, tokenAmount } from 'library/AssetHub'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AssetHubPool, ImportedAccount } from 'types'
import { PageTabs } from 'ui-app/PageTabs'
import { ButtonSecondary } from 'ui-buttons'
import styles from './index.module.scss'

type PoolTab = 'pools' | 'positions'

export const PoolList = ({
	pools,
	account,
	tab,
	onTabChange,
}: {
	pools?: AssetHubPool[]
	account: ImportedAccount | null
	tab: PoolTab
	onTabChange: (tab: PoolTab) => void
}) => {
	const { t } = useTranslation('swap')
	const navigate = useNavigate()
	const { search } = useLocation()
	const shown = pools?.filter((pool) => tab === 'pools' || pool.lpBalance > 0n)

	return (
		<>
			<PageTabs
				tabs={[
					{
						title: t('pools'),
						active: tab === 'pools',
						onClick: () => onTabChange('pools'),
					},
					{
						title: t('yourPositions'),
						active: tab === 'positions',
						onClick: () => onTabChange('positions'),
					},
				]}
			/>
			{tab === 'positions' && !account ? (
				<p className={styles.notice}>{t('selectAccountForPositions')}</p>
			) : (
				pools && (
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<caption className={styles.tableCaption}>
								{t(tab === 'positions' ? 'yourPositions' : 'pools')}
							</caption>
							<thead>
								<tr>
									<th scope="col">{t('pool')}</th>
									<th scope="col">{t('reserves')}</th>
									<th scope="col">{t('swapFee')}</th>
									<th scope="col">{t('yourShare')}</th>
									<th scope="col">{t('manage')}</th>
								</tr>
							</thead>
							<tbody>
								{shown?.map((pool) => (
									<tr key={pool.asset}>
										<th scope="row">
											DOT / {pool.asset}
											<small>
												{t('lpToken')} #{pool.lpToken}
											</small>
										</th>
										<td>
											{tokenAmount(pool.reserveDot, 'DOT')} DOT
											<small>
												{tokenAmount(pool.reserveAsset, pool.asset)}{' '}
												{pool.asset}
											</small>
										</td>
										<td>{percentage(pool.fee)}</td>
										<td>
											{account && pool.lpSupply > 0n
												? `${formatUnits((pool.lpBalance * 1_000_000n) / pool.lpSupply, 4)}%`
												: '—'}
											{pool.lpBalance > 0n && pool.lpSupply > 0n && (
												<small>
													{tokenAmount(
														(pool.lpBalance * pool.reserveAsset) /
															pool.lpSupply,
														pool.asset,
													)}{' '}
													{pool.asset} +{' '}
													{tokenAmount(
														(pool.lpBalance * pool.reserveDot) / pool.lpSupply,
														'DOT',
													)}{' '}
													DOT
												</small>
											)}
										</td>
										<td>
											<ButtonSecondary
												text={t('manage')}
												onClick={() =>
													navigate(`/liquidity/${pool.asset}${search}`)
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{shown?.length === 0 && (
							<p className={styles.notice}>
								{t(tab === 'positions' ? 'noPositions' : 'noPools')}
							</p>
						)}
					</div>
				)
			)}
		</>
	)
}
