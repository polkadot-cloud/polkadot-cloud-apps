// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ellipsisFn } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { ListProvider, useList } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { formatDistance, fromUnixTime } from 'date-fns'
import { useApi } from 'hooks/useApi'
import { useDateFormat } from 'hooks/useDateFormat'
import { useNetwork } from 'hooks/useNetwork'
import { useThemeValues } from 'hooks/useThemeValues'
import { Header, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { Identity } from 'library/ListItem/Labels/Identity'
import { PoolIdentity } from 'library/ListItem/Labels/PoolIdentity'
import { motion } from 'motion/react'
import { isPoolReward, isPoolShareReward } from 'plugin-staking-api'
import type {
	NominatorReward,
	PoolReward,
	RewardResults,
} from 'plugin-staking-api/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { planckToUnitBn } from 'utils'
import type { PayoutListProps } from '../types'
import { ItemWrapper, ListEndBadge, ListStatusWrapper } from '../Wrappers'

export const PayoutList = ({
	allowMoreCols,
	pagination,
	title,
	payouts: initialPayouts,
	endBadge,
	itemsPerPage,
	loading,
	remotePagination,
}: PayoutListProps) => {
	const { i18n, t } = useTranslation('pages')
	const { isReady, activeEra } = useApi()
	const { network } = useNetwork()
	const { bondedPools } = useBondedPools()
	const { getValidators } = useValidators()
	const { getThemeValue } = useThemeValues()
	const dateFormat = useDateFormat(i18n.resolvedLanguage)
	const {
		listFormat,
		setListFormat,
		pagination: { page, setPage },
	} = useList()
	const { unit, units } = getStakingChainData(network)

	// Manipulated list (ordering, filtering) of payouts
	const [payouts, setPayouts] = useState<RewardResults>(initialPayouts)

	// Whether still in initial fetch
	const [fetched, setFetched] = useState<boolean>(false)

	// When using remote pagination, pagination state is controlled by the parent and the provided
	// `payouts` already represents the current page. Otherwise fall back to in-memory slicing using
	// the list context's page state.
	const remote = !!remotePagination
	const currentPage = remotePagination?.page ?? page
	const setCurrentPage = remotePagination?.setPage ?? setPage
	const totalPages = remote
		? undefined
		: Math.ceil(payouts.length / itemsPerPage)
	const pageEnd = currentPage * itemsPerPage - 1
	const pageStart = pageEnd - (itemsPerPage - 1)

	// Refetch list when list changes
	useEffect(() => {
		setFetched(false)
	}, [initialPayouts])

	// Configure list when network is ready to fetch
	useEffect(() => {
		if (isReady && activeEra.index > 0 && !fetched) {
			setPayouts(initialPayouts)
			setFetched(true)
		}
	}, [isReady, fetched, activeEra.index])

	const listPayouts = remote
		? payouts
		: payouts.slice(pageStart).slice(0, itemsPerPage)
	const status = !listPayouts.length
		? loading
			? `${t('syncing', { ns: 'app' })}...`
			: `${t('noRecentPayouts')}.`
		: null

	const allValidators = getValidators()

	return (
		<ListWrapper>
			<Header>
				<div>
					<h4>{title}</h4>
				</div>
				<div>
					<button type="button" onClick={() => setListFormat('row')}>
						<FontAwesomeIcon
							icon={faBars}
							color={
								listFormat === 'row' ? getThemeValue('--gray-1000') : 'inherit'
							}
						/>
					</button>
					<button type="button" onClick={() => setListFormat('col')}>
						<FontAwesomeIcon
							icon={faGripVertical}
							color={
								listFormat === 'col' ? getThemeValue('--gray-1000') : 'inherit'
							}
						/>
					</button>
				</div>
			</Header>
			<List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
				{pagination && (
					<Pagination
						page={currentPage}
						total={totalPages}
						hasNext={remotePagination?.hasNext}
						setter={setCurrentPage}
						disabled={!!loading}
					/>
				)}
				{status ? (
					<ListStatusWrapper>
						<h3>{status}</h3>
					</ListStatusWrapper>
				) : (
					<MotionContainer>
						{listPayouts.map((p) => {
							const poolReward = isPoolReward(p)
							const record = poolReward
								? (p as PoolReward)
								: (p as NominatorReward)

							const label = poolReward
								? isPoolShareReward(p)
									? t('share', { ns: 'app' })
									: t('poolClaim', { ns: 'app' })
								: t('payout', { ns: 'app' })

							const labelClass = isPoolShareReward(p)
								? 'share'
								: poolReward
									? 'claim'
									: 'reward'

							let batchIndex
							let pool: BondedPool | undefined
							let keyId: string
							if (poolReward) {
								const item = p as PoolReward
								const poolIndex = bondedPools.findIndex(
									({ id }) => id === item.poolId,
								)
								pool = poolIndex >= 0 ? bondedPools[poolIndex] : undefined
								batchIndex = Math.max(poolIndex, 0)
								keyId = `pool_${item.source ?? 'claim'}_${item.poolId}_${item.timestamp}`
							} else {
								const item = p as NominatorReward
								const validatorIndex = allValidators.findIndex(
									(v) => v.address === item.validator,
								)
								batchIndex = Math.max(validatorIndex, 0)
								keyId = `nom_${item.validator}_${item.era}_${item.timestamp}`
							}

							return (
								<motion.div
									className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
									key={keyId}
									variants={{
										hidden: {
											y: 15,
											opacity: 0,
										},
										show: {
											y: 0,
											opacity: 1,
										},
									}}
								>
									<ItemWrapper>
										<div
											className={`inner${isPoolShareReward(p) ? ' share' : ''}`}
										>
											<div className="row">
												<div>
													<div>
														<h4 className={labelClass}>
															+
															{planckToUnitBn(
																new BigNumber(record.reward),
																units,
															).toString()}{' '}
															{unit}
														</h4>
													</div>
													<div>
														<h5 className={labelClass}>{label}</h5>
													</div>
												</div>
											</div>
											<div className="row">
												<div>
													<div>
														{!poolReward ? (
															<NominatorIdentity
																batchIndex={batchIndex}
																address={(record as NominatorReward).validator}
															/>
														) : (
															<PoolClaim
																pool={pool}
																poolId={(record as PoolReward).poolId}
															/>
														)}
														{label === t('slashed') && (
															<h4>{t('deductedFromBond')}</h4>
														)}
													</div>
													<div>
														<h5>
															{formatDistance(
																fromUnixTime(record.timestamp),
																new Date(),
																{
																	addSuffix: true,
																	locale: dateFormat,
																},
															)}
														</h5>
													</div>
												</div>
											</div>
										</div>
									</ItemWrapper>
								</motion.div>
							)
						})}
						{endBadge && <EndBadge>{endBadge}</EndBadge>}
					</MotionContainer>
				)}
			</List>
		</ListWrapper>
	)
}

export const Inner = (props: PayoutListProps) => (
	<ListProvider>
		<PayoutList {...props} />
	</ListProvider>
)

const EndBadge = ({ children }: { children: string }) => (
	<motion.div
		className="item row"
		variants={{
			hidden: {
				y: 15,
				opacity: 0,
			},
			show: {
				y: 0,
				opacity: 1,
			},
		}}
	>
		<ListEndBadge>
			<span>{children}</span>
		</ListEndBadge>
	</motion.div>
)

export const NominatorIdentity = ({
	batchIndex,
	address,
}: {
	batchIndex: number
	address: string
}) =>
	batchIndex > 0 ? (
		<Identity address={address} />
	) : (
		<div>{ellipsisFn(address)}</div>
	)

export const PoolClaim = ({
	pool,
	poolId,
}: {
	pool: BondedPool | undefined
	poolId: number
}) => {
	const { t } = useTranslation('pages')
	return pool ? (
		<PoolIdentity pool={pool} />
	) : (
		<h4>
			{t('fromPool')} {poolId}
		</h4>
	)
}
