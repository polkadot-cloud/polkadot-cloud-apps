// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import { getChainIcons } from 'assets'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useBalances } from 'hooks/useBalances'
import { useCurrency } from 'hooks/useCurrency'
import { useNetwork } from 'hooks/useNetwork'
import { useSyncing } from 'hooks/useSyncing'
import { Balance } from 'library/Balance'
import { BarSegment } from 'library/BarChart/BarSegment'
import { LegendItem } from 'library/BarChart/LegendItem'
import { Bar, BarChartWrapper, Legend } from 'library/BarChart/Wrappers'
import { useTranslation } from 'react-i18next'
import { ButtonTertiary } from 'ui-buttons'
import { CardHeader } from 'ui-core/base'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'

export const BalanceChart = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { currency } = useCurrency()
	const { feeReserve } = useBalances()
	const { openModal } = useOverlay().modal
	const { syncing } = useSyncing(['initialization'])
	const { accountHasSigner } = useImportedAccounts()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { unit, units } = getStakingChainData(network)
	const Token = getChainIcons(network).token

	// Convert to BigNumber for display and percentage calculations
	const totalBalance = planckToUnitBn(
		new BigNumber(balances.totalBalance),
		units,
	)
	const nominating = planckToUnitBn(
		new BigNumber(
			balances.nominator.active +
				balances.nominator.totalUnlocking +
				balances.nominator.totalUnlocked,
		),
		units,
	)
	const inPoolPlanck =
		balances.pool.active +
		balances.pool.totalUnlocking +
		balances.pool.totalUnlocked
	const inPool = planckToUnitBn(new BigNumber(inPoolPlanck), units)
	const fundsTransferable = new BigNumber(
		planckToUnit(balances.transferableBalance, units),
	)
	const fundsLocked = planckToUnitBn(
		new BigNumber(balances.lockedBalance),
		units,
	)
	const freeBalanceBn = planckToUnitBn(
		new BigNumber(balances.freeBalance),
		units,
	)

	// Graph percentages for staking overview
	const graphTotal = nominating.plus(inPool).plus(fundsTransferable)
	const graphNominating = nominating.isGreaterThan(0)
		? nominating.dividedBy(graphTotal.multipliedBy(0.01))
		: new BigNumber(0)

	const graphInPool = inPool.isGreaterThan(0)
		? inPool.dividedBy(graphTotal.multipliedBy(0.01))
		: new BigNumber(0)

	const graphNotStaking = graphTotal.isGreaterThan(0)
		? BigNumber.max(
				new BigNumber(100).minus(graphNominating).minus(graphInPool),
				0,
			)
		: new BigNumber(0)

	// Available balance data
	const fundsFree = freeBalanceBn

	// Available balance percentages
	const graphLocked = fundsLocked.isGreaterThan(0)
		? fundsLocked.dividedBy(freeBalanceBn.multipliedBy(0.01))
		: new BigNumber(0)

	const graphFree = fundsFree.isGreaterThan(0)
		? fundsFree.dividedBy(freeBalanceBn.multipliedBy(0.01))
		: new BigNumber(0)

	// Total amount reserved for fees and existential deposit
	let fundsReserved = new BigNumber(
		planckToUnit(balances.edReserved + feeReserve, units),
	)
	if (freeBalanceBn.isLessThan(fundsReserved)) {
		fundsReserved = freeBalanceBn
	}

	const isNominating = nominating.isGreaterThan(0)
	const isInPool = inPool.isGreaterThan(0)
	const dualStaking = isNominating && isInPool

	return (
		<>
			<CardHeader>
				<h4>{t('balance')}</h4>
				<Balance.WithFiat
					Token={<Token />}
					value={totalBalance.toNumber()}
					currency={currency}
				/>
			</CardHeader>
			<BarChartWrapper>
				<Legend>
					{isNominating ? (
						<LegendItem dataClass="d1" label={t('nominating')} />
					) : null}
					{inPool.isGreaterThan(0) ? (
						<LegendItem
							dataClass={dualStaking ? 'd2' : 'd1'}
							label={t('inPool')}
						/>
					) : null}
					<LegendItem dataClass="d4" label={t('notStaking')} />
				</Legend>
				<Bar>
					<BarSegment
						dataClass="d1"
						widthPercent={Number(graphNominating.toFixed(2))}
						flexGrow={!inPool && !fundsTransferable && isNominating ? 1 : 0}
						label={`${nominating.decimalPlaces(3).toFormat()} ${unit}`}
					/>
					<BarSegment
						dataClass={dualStaking ? 'd2' : 'd1'}
						widthPercent={Number(graphInPool.toFixed(2))}
						flexGrow={!isNominating && !fundsTransferable && inPool ? 1 : 0}
						label={`${inPool.decimalPlaces(3).toFormat()} ${unit}`}
					/>
					<BarSegment
						dataClass="d4"
						widthPercent={Number(graphNotStaking.toFixed(2))}
						flexGrow={!isNominating && !inPool ? 1 : 0}
						label={`${fundsTransferable.decimalPlaces(3).toFormat()} ${unit}`}
						forceShow={!isNominating && !isInPool}
					/>
				</Bar>
				<section className="available">
					<div
						style={{
							flex: 1,
							minWidth: '8.5rem',
							flexBasis: `${
								graphFree.isGreaterThan(0) && graphLocked.isGreaterThan(0)
									? `${graphFree.toFixed(2)}%`
									: 'auto'
							}`,
						}}
					>
						<Legend>
							<LegendItem label={t('free')} />
						</Legend>
						<Bar>
							<BarSegment
								dataClass="d4"
								widthPercent={100}
								flexGrow={1}
								label={`${fundsTransferable.decimalPlaces(3).toFormat()} ${unit}`}
							/>
						</Bar>
					</div>
					{fundsLocked.isGreaterThan(0) ? (
						<div
							style={{
								flex: 1,
								minWidth: '8.5rem',
								flexBasis: `${graphLocked.toFixed(2)}%`,
							}}
						>
							<Legend>
								<LegendItem label={t('locked')} />
							</Legend>
							<Bar>
								<BarSegment
									dataClass="d4"
									widthPercent={100}
									flexGrow={1}
									label={`${fundsLocked.decimalPlaces(3).toFormat()} ${unit}`}
								/>
							</Bar>
						</div>
					) : null}
					<div
						style={{
							flex: 0,
							minWidth: '12.5rem',
							maxWidth: '12.5rem',
							flexBasis: '50%',
						}}
					>
						<Legend className="end">
							<LegendItem
								label=""
								button={
									<ButtonTertiary
										text={t('reserved')}
										onClick={() =>
											openModal({ key: 'UpdateReserve', size: 'sm' })
										}
										iconRight={
											syncing
												? undefined
												: feeReserve > 0n && balances.edReserved !== 0n
													? faCheckDouble
													: feeReserve === 0n && balances.edReserved === 0n
														? undefined
														: faCheck
										}
										iconTransform="shrink-1"
										disabled={
											!activeAddress ||
											syncing ||
											!accountHasSigner(activeAccount)
										}
									/>
								}
							/>
						</Legend>
						<Bar>
							<BarSegment
								dataClass="d4"
								widthPercent={100}
								flexGrow={1}
								label={`${fundsReserved.decimalPlaces(3).toFormat()} ${unit}`}
							/>
						</Bar>
					</div>
				</section>
			</BarChartWrapper>
		</>
	)
}
