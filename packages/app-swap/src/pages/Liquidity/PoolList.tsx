// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import { assetHubDecimals } from 'consts/assetHub'
import { getThemeElement } from 'hooks/useTheme'
import { formatUnits, percentage, tokenAmount } from 'library/AssetHub'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AssetHubPool, AssetHubToken, ImportedAccount } from 'types'
import { CardWrapper } from 'ui-app/Card'
import { PageTabs } from 'ui-app/PageTabs'
import { ButtonSecondary } from 'ui-buttons'
import { DataTable, Tooltip } from 'ui-core/base'
import styles from './index.module.scss'

type PoolTab = 'pools' | 'positions'

const reserveDisplayDecimals = 4

const formatReserve = (amount: bigint, token: AssetHubToken) => {
	const scale = 10n ** BigInt(assetHubDecimals(token) - reserveDisplayDecimals)
	if (amount > 0n && amount < scale) {
		return `<${formatUnits(1n, reserveDisplayDecimals)}`
	}
	return formatUnits((amount + scale / 2n) / scale, reserveDisplayDecimals)
}

const PoolReserves = ({ pool }: { pool: AssetHubPool }) => (
	<Tooltip
		container={getThemeElement() ?? undefined}
		text={
			<>
				<span className={styles.reserveAmount}>
					{tokenAmount(pool.reserveDot, 'DOT')} DOT
				</span>
				<span className={styles.reserveAmount}>
					{tokenAmount(pool.reserveAsset, pool.asset)} {pool.asset}
				</span>
			</>
		}
	>
		<button
			type="button"
			className={classNames(styles.tableValue, styles.reserveTrigger)}
		>
			<span className={styles.reserveAmount}>
				{formatReserve(pool.reserveDot, 'DOT')} DOT
			</span>
			<span className={classNames(styles.reserveAmount, styles.reserveAsset)}>
				{formatReserve(pool.reserveAsset, pool.asset)} {pool.asset}
			</span>
		</button>
	</Tooltip>
)

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
					<CardWrapper>
						<DataTable.Root
							label={t(tab === 'positions' ? 'yourPositions' : 'pools')}
						>
							<DataTable.Head>
								<DataTable.Cells
									scope="col"
									items={[
										t('pool'),
										t('reserves'),
										t('swapFee'),
										t('yourShare'),
										t('options'),
									]}
								/>
							</DataTable.Head>
							<tbody>
								{shown?.map((pool) => (
									<DataTable.Row key={pool.asset}>
										<DataTable.Cell scope="row">
											<DataTable.Label>DOT / {pool.asset}</DataTable.Label>
											<small className={styles.tableDetail}>
												{t('lpToken')} #{pool.lpToken}
											</small>
										</DataTable.Cell>
										<DataTable.Cell>
											<PoolReserves pool={pool} />
										</DataTable.Cell>
										<DataTable.Cell>
											<span className={styles.tableValue}>
												{percentage(pool.fee)}
											</span>
										</DataTable.Cell>
										<DataTable.Cell>
											<span className={styles.tableValue}>
												{account && pool.lpSupply > 0n
													? `${formatUnits((pool.lpBalance * 1_000_000n) / pool.lpSupply, 4)}%`
													: '—'}
											</span>
											{pool.lpBalance > 0n && pool.lpSupply > 0n && (
												<small className={styles.tableDetail}>
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
										</DataTable.Cell>
										<DataTable.Cell>
											<ButtonSecondary
												text={t('manage')}
												onClick={() =>
													navigate(`/liquidity/${pool.asset}${search}`)
												}
											/>
										</DataTable.Cell>
									</DataTable.Row>
								))}
							</tbody>
						</DataTable.Root>
						{shown?.length === 0 && (
							<p className={styles.notice}>
								{t(tab === 'positions' ? 'noPositions' : 'noPools')}
							</p>
						)}
					</CardWrapper>
				)
			)}
		</>
	)
}
