// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffectIgnoreInitial } from '@w3ux/hooks'
import { useFilters } from 'contexts/Filters'
import { useList } from 'contexts/List'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePoolFilters } from 'hooks/usePoolFilters'
import { useSyncing } from 'hooks/useSyncing'
import { useThemeValues } from 'hooks/useThemeValues'
import { Tabs } from 'library/Filter/Tabs'
import {
	FilterHeaderWrapper,
	List,
	ListStatusHeader,
	Wrapper as ListWrapper,
} from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { SearchInput } from 'library/List/SearchInput'
import { Pool } from 'library/Pool'
import { motion } from 'motion/react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import type { PoolListProps } from './types'

export const PoolList = ({
	allowMoreCols,
	allowSearch,
	pools,
	allowListFormat = true,
	itemsPerPage,
}: PoolListProps) => {
	const { t } = useTranslation('app')
	const { activeEra } = useApi()
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { applyFilter } = usePoolFilters()
	const { getThemeValue } = useThemeValues()
	const { listFormat, setListFormat } = useList()
	const { poolSearchFilter, poolsNominations } = useBondedPools()
	const { getFilters, getSearchTerm, setSearchTerm } = useFilters()

	const includes = getFilters('include', 'pools')
	const excludes = getFilters('exclude', 'pools')
	const searchTerm = getSearchTerm('pools')

	// The current page of pool list.
	const [page, setPage] = useState<number>(1)

	// Default pool list items before filtering.
	const [poolsDefault, setPoolsDefault] = useState<BondedPool[]>(pools || [])

	// Carry out filter of pool list.
	const filterPoolList = () => {
		let filteredPools = [...poolsDefault]
		filteredPools = applyFilter(includes, excludes, filteredPools)
		if (searchTerm) {
			filteredPools = poolSearchFilter(filteredPools, searchTerm)
		}
		return filteredPools
	}

	// Manipulated pool list items after filtering.
	const [listPools, setListPools] = useState<BondedPool[]>(() =>
		filterPoolList(),
	)

	// Whether this the initial render.
	const [synced, setSynced] = useState<boolean>(false)

	// Handle Pagination.
	const pageLength = itemsPerPage || listPools.length
	const totalPages = Math.ceil(listPools.length / pageLength)
	const pageEnd = page * pageLength - 1
	const pageStart = pageEnd - (pageLength - 1)

	// Get paged subset of list items.
	const poolsToDisplay = listPools.slice(pageStart).slice(0, pageLength)

	// Handle resetting of pool list when provided pools change.
	const resetPoolList = () => {
		setPoolsDefault(pools || [])
		setListPools(pools || [])
		setSynced(true)
	}

	// Handle filter / order update
	const handlePoolsFilterUpdate = () => {
		const filteredPools = filterPoolList()
		setListPools(filteredPools)
		setPage(1)
	}

	const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value

		let filteredPools: BondedPool[] = [...poolsDefault]
		// Apply filters first, then search, to avoid unnecessary search computations on pools that are
		// already filtered out
		filteredPools = applyFilter(includes, excludes, filteredPools)
		filteredPools = poolSearchFilter(filteredPools, newValue)

		setPage(1)
		setListPools(filteredPools)
		setSearchTerm('pools', newValue)
	}

	// Refetch list when pool list changes.
	useEffect(() => {
		const poolIds = pools?.map((pool) => pool.id)
		const poolIdsDefault = poolsDefault?.map((pool) => pool.id)
		if (JSON.stringify(poolIds) !== JSON.stringify(poolIdsDefault) && synced) {
			resetPoolList()
		}
	}, [JSON.stringify(pools?.map((pool) => pool.id))])

	// List ui changes / validator changes trigger re-render of list.
	useEffect(() => {
		// only filter when pool nominations have been synced.
		if (!syncing && Object.keys(poolsNominations).length) {
			handlePoolsFilterUpdate()
		}
	}, [syncing, includes, excludes, Object.keys(poolsNominations).length])

	// Scroll to top of the window on every filter.
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [includes, excludes])

	// Reset list on network change or active era change.
	useEffectIgnoreInitial(() => {
		resetPoolList()
	}, [network, activeEra.index.toString()])

	return (
		<ListWrapper>
			<List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
				{allowSearch && poolsDefault.length > 0 && (
					<SearchInput
						value={searchTerm ?? ''}
						handleChange={handleSearchChange}
						placeholder={t('search')}
					/>
				)}
				<FilterHeaderWrapper>
					<div>
						<Tabs
							config={[
								{
									label: t('all'),
									includes: [],
									excludes: [],
								},
								{
									label: t('active'),
									includes: ['active'],
									excludes: ['locked', 'destroying'],
								},
								{
									label: t('locked'),
									includes: ['locked'],
									excludes: [],
								},
								{
									label: t('destroying'),
									includes: ['destroying'],
									excludes: [],
								},
							]}
						/>
					</div>
					<div>
						{allowListFormat && (
							<div>
								<button type="button" onClick={() => setListFormat('row')}>
									<FontAwesomeIcon
										icon={faBars}
										color={
											listFormat === 'row'
												? getThemeValue('--gray-1000')
												: 'inherit'
										}
									/>
								</button>
								<button type="button" onClick={() => setListFormat('col')}>
									<FontAwesomeIcon
										icon={faGripVertical}
										color={
											listFormat === 'col'
												? getThemeValue('--gray-1000')
												: 'inherit'
										}
									/>
								</button>
							</div>
						)}
					</div>
				</FilterHeaderWrapper>

				{itemsPerPage && poolsToDisplay.length > 0 && (
					<Pagination page={page} total={totalPages} setter={setPage} />
				)}
				<MotionContainer>
					{poolsToDisplay.length ? (
						poolsToDisplay.map((pool) => (
							<motion.div
								className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
								key={`nomination_${pool.id}`}
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
								<Pool pool={pool} />
							</motion.div>
						))
					) : (
						<ListStatusHeader>
							{syncing ? `${t('syncingPoolList')}...` : t('noMatch')}
						</ListStatusHeader>
					)}
				</MotionContainer>
			</List>
		</ListWrapper>
	)
}
