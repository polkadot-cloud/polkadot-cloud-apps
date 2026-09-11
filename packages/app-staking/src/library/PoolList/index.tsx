// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { SearchInput } from 'library/List/SearchInput'
import { Pool } from 'library/Pool'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
	const { syncing } = useSyncing(['bonded-pools'])
	const { network } = useNetwork()
	const { getThemeValue } = useThemeValues()
	const { listFormat, setListFormat } = useList()
	const { poolSearchFilter } = useBondedPools()
	const { getFilters, getSearchTerm, setSearchTerm } = useFilters()

	const includes = getFilters('include', 'pools')
	const excludes = getFilters('exclude', 'pools')
	const { applyFilter, activityLoading, activityError } = usePoolFilters(
		pools ?? [],
		[...(includes ?? []), ...(excludes ?? [])].includes('active'),
	)
	const searchTerm = getSearchTerm('pools')

	// The current page of pool list.
	const [page, setPage] = useState<number>(1)

	// Derive each view from the shared pool and nomination snapshots. A tab change never
	// copies or reloads the list, and data arriving after mount is reflected immediately.
	const listPools = useMemo(() => {
		const filtered = applyFilter(includes, excludes, pools ?? [])
		return searchTerm ? poolSearchFilter(filtered, searchTerm) : filtered
	}, [pools, includes, excludes, applyFilter, searchTerm, poolSearchFilter])

	const pageLength = itemsPerPage || Math.max(1, listPools.length)
	const totalPages = Math.max(1, Math.ceil(listPools.length / pageLength))
	const currentPage = Math.min(page, totalPages)
	const pageStart = (currentPage - 1) * pageLength
	const poolsToDisplay = listPools.slice(pageStart, pageStart + pageLength)
	const loading = activityLoading || (!pools?.length && syncing)

	const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
		setPage(1)
		setSearchTerm('pools', e.currentTarget.value)
	}

	useEffect(() => {
		setPage(1)
	}, [network, activeEra.index, includes, excludes, searchTerm])

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [includes, excludes])

	return (
		<ListWrapper>
			<List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
				{allowSearch && !!pools?.length && (
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
					<Pagination page={currentPage} total={totalPages} setter={setPage} />
				)}
				<MotionContainer>
					{poolsToDisplay.length ? (
						poolsToDisplay.map((pool) => (
							<MotionItem
								className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
								key={`nomination_${pool.id}`}
							>
								<Pool pool={pool} />
							</MotionItem>
						))
					) : (
						<ListStatusHeader>
							{activityError
								? '—'
								: loading
									? `${t('syncingPoolList')}...`
									: t('noMatch')}
						</ListStatusHeader>
					)}
				</MotionContainer>
			</List>
		</ListWrapper>
	)
}
