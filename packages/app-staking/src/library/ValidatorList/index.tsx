// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { getPeopleChainId } from 'consts/util'
import { useFilters } from 'contexts/Filters'
import { ListProvider, useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useSyncing } from 'hooks/useSyncing'
import { useValidatorRewardRateBatch } from 'hooks/useValidatorRewardRateBatch'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { SearchInput } from 'library/List/SearchInput'
import { motion } from 'motion/react'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { NominationStatus, Validator } from 'types'
import { ListFormatToggle } from 'ui-app/ListItem'
import { useOverlay } from 'ui-overlay'
import { useValidatorFilters } from '../../hooks/useValidatorFilters'
import { FilterBadges } from './Filters/FilterBadges'
import { FilterHeaders } from './Filters/FilterHeaders'
import { Item } from './Item'
import type { ValidatorListProps } from './types'

const CARD_LAYOUT_MEDIA_QUERY = '(max-width: 1199px)'

export const ValidatorListInner = ({
	// Default list values.
	nominator: initialNominator,
	validators: initialValidators,
	// Validator list config options.
	bondFor,
	allowMoreCols,
	allowFilters,
	toggleFavorites,
	itemsPerPage,
	onSelected,
	displayFor = 'default',
	allowSearch = false,
	allowListFormat = true,
	defaultOrder = undefined,
	defaultFilters = undefined,
	BeforeListNode = null,
	onRemove,
}: ValidatorListProps) => {
	const { t } = useTranslation()
	const {
		getFilters,
		setMultiFilters,
		getOrder,
		setOrder,
		getSearchTerm,
		setSearchTerm,
		resetFilters,
		resetOrder,
		clearSearchTerm,
		// Inject default filters and orders here
	} = useFilters()
	const listProvider = useList()
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { pluginEnabled } = usePlugins()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const { activeAddress } = useActiveAccount()
	const { setModalResize } = useOverlay().modal
	const { injectValidatorListData } = useValidators()
	const { isReady, activeEra, getApiStatus } = useApi()
	const { applyFilter, applyOrder, applySearch } = useValidatorFilters()
	const {
		selected,
		listFormat,
		setListFormat,
		pagination: { page, setPage },
	} = listProvider
	const includes = getFilters('include', 'validators')
	const excludes = getFilters('exclude', 'validators')
	const order = getOrder('validators')
	const searchTerm = getSearchTerm('validators')

	// Track whether filter bootstrapping has been applied.
	const [bootstrapped, setBootstrapped] = useState<boolean>(false)

	// Determine the nominator of the validator list. Fallback to activeAddress if not provided
	const nominator = initialNominator || activeAddress

	// Store the current nomination status of validator records relative to the supplied nominator
	const nominationStatus = useRef<Record<string, NominationStatus>>({})

	// Injects status into supplied initial validators
	const prepareInitialValidators = () => {
		const statusToIndex = {
			active: 2,
			inactive: 1,
			waiting: 0,
		}
		return injectValidatorListData(initialValidators).sort(
			(a, b) =>
				statusToIndex[nominationStatus.current[b.address]] -
				statusToIndex[nominationStatus.current[a.address]],
		)
	}

	// Default list of validators
	const [validatorsDefault, setValidatorsDefault] = useState<
		ValidatorListEntry[]
	>(() => prepareInitialValidators())

	// Manipulated list (custom ordering, filtering) of validators
	const [validators, setValidators] = useState<ValidatorListEntry[]>(() =>
		prepareInitialValidators(),
	)

	// Store whether the validator list has been fetched initially
	const [fetched, setFetched] = useState<boolean>(false)

	// Store whether the search bar is being used
	const [isSearching, setIsSearching] = useState<boolean>(false)
	const [forceCardLayout, setForceCardLayout] = useState<boolean>(() =>
		typeof window === 'undefined'
			? false
			: window.matchMedia(CARD_LAYOUT_MEDIA_QUERY).matches,
	)
	const effectiveListFormat =
		stakingApiEnabled && forceCardLayout ? 'col' : listFormat

	// Store all API-backed detailed card data by request key.
	const [detailsByKey, setDetailsByKey] = useState<
		Record<string, ValidatorDetailsBatchData>
	>({})

	// Pagination
	const pageLength: number = itemsPerPage || validators.length
	const totalPages = Math.ceil(validators.length / pageLength)
	const pageEnd = page * pageLength - 1
	const pageStart = pageEnd - (pageLength - 1)

	// handle filter / order update
	const handleValidatorsFilterUpdate = (
		filteredValidators = [...validatorsDefault],
	) => {
		if (allowFilters) {
			if (order !== 'default') {
				filteredValidators = applyOrder(order, filteredValidators)
			}
			filteredValidators = applyFilter(includes, excludes, filteredValidators)
			if (searchTerm) {
				filteredValidators = applySearch(filteredValidators, searchTerm)
			}
			setValidators(filteredValidators)
			setPage(1)
		}
	}

	// Get subset for page display.
	const listItems = useMemo(
		() => validators.slice(pageStart, pageStart + pageLength),
		[validators, pageStart, pageLength],
	)

	const pageKey = useMemo(() => {
		const itemKeys = listItems
			.map(({ address }, i) => `${i}${address}`)
			.join(',')
		const inc = includes?.join(',') ?? ''
		const exc = excludes?.join(',') ?? ''
		const search = searchTerm ?? ''
		return `${itemKeys}|${inc}|${exc}|${order}|${search}`
	}, [listItems, includes, excludes, order, searchTerm])
	const detailsKey = useMemo(
		() =>
			JSON.stringify({
				network,
				era: activeEra.index,
				rewardRateDepth: erasPerDay,
				validators: listItems.map(({ address }) => address),
			}),
		[network, activeEra.index, erasPerDay, listItems],
	)
	const details = detailsByKey[detailsKey]
	const detailsPreloading = stakingApiEnabled && details === undefined

	const performanceByAddress = useMemo(
		() =>
			new Map(
				(details?.validatorEraPointsBatch ?? []).map(
					(entry) => [entry.validator, entry.points] as const,
				),
			),
		[details],
	)
	const rateByAddress = useMemo(
		() =>
			new Map(
				(details?.validatorAvgRewardRateBatch ?? []).map(
					(entry) => [entry.validator, entry.rate] as const,
				),
			),
		[details],
	)
	const retainmentByAddress = useMemo(
		() =>
			new Map(
				(details?.validatorRetainmentBatch ?? []).map(
					(entry) => [entry.validator, entry.result] as const,
				),
			),
		[details],
	)

	// if in modal, handle resize
	const maybeHandleModalResize = () => {
		if (displayFor === 'modal') {
			setModalResize()
		}
	}

	// Get validator reward rates
	const { rates } = useValidatorRewardRateBatch(
		listItems.map(({ address }) => address),
		pageKey,
		stakingApiEnabled,
	)

	const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value

		let filteredValidators = [...validatorsDefault]
		if (order !== 'default') {
			filteredValidators = applyOrder(order, filteredValidators)
		}
		filteredValidators = applyFilter(includes, excludes, filteredValidators)
		filteredValidators = applySearch(filteredValidators, newValue)
		// Ensure no duplicates
		filteredValidators = filteredValidators.filter(
			(value: Validator, index: number, self: Validator[]) =>
				index === self.findIndex((i) => i.address === value.address),
		)
		setPage(1)
		setValidators(filteredValidators)
		setIsSearching(e.currentTarget.value !== '')
		setSearchTerm('validators', newValue)
	}

	// Handle validator list bootstrapping.
	const setupValidatorList = () => {
		setValidatorsDefault(prepareInitialValidators())
		setValidators(prepareInitialValidators())
		setFetched(true)
	}

	// Fetch all data needed by detailed validator cards in one GraphQL operation.
	const getDetailedData = async (key: string) => {
		if (!stakingApiEnabled || activeEra.index === 0 || listItems.length === 0) {
			return
		}
		const results = await fetchValidatorDetailsBatch(
			network,
			listItems.map(({ address }) => address),
			Math.max(activeEra.index - 1, 0),
			erasPerDay,
			30,
		)
		setDetailsByKey((current) => ({ ...current, [key]: results }))
	}

	// Set default filters. Should re-render if era stakers re-syncs as era points effect the
	// performance order
	useEffect(() => {
		if (!syncing && allowFilters) {
			if (defaultFilters?.includes?.length) {
				setMultiFilters(
					'include',
					'validators',
					defaultFilters?.includes,
					false,
				)
			}
			if (defaultFilters?.excludes?.length) {
				setMultiFilters(
					'exclude',
					'validators',
					defaultFilters?.excludes,
					false,
				)
			}
			if (defaultOrder) {
				setOrder('validators', defaultOrder)
			}
			setBootstrapped(true)
		} else {
			setBootstrapped(true)
		}
		return () => {
			if (allowFilters) {
				resetFilters('exclude', 'validators')
				resetFilters('include', 'validators')
				resetOrder('validators')
				clearSearchTerm('validators')
			}
		}
	}, [syncing])

	// Reset list when validator list changes
	useEffect(() => {
		setFetched(false)
	}, [initialValidators, nominator])

	// Fetch detailed card data when the visible validator set changes.
	useEffect(() => {
		getDetailedData(detailsKey)
	}, [detailsKey, stakingApiEnabled])

	// Configure validator list when network is ready to fetch
	useEffect(() => {
		if (isReady && activeEra.index > 0) {
			setupValidatorList()
		}
	}, [isReady, activeEra.index, syncing, fetched])

	// Trigger `onSelected` when selection changes
	useEffect(() => {
		if (onSelected) {
			onSelected(listProvider)
		}
	}, [selected])

	// List ui changes / validator changes trigger re-render of list
	useEffect(() => {
		if (allowFilters && fetched) {
			handleValidatorsFilterUpdate()
		}
	}, [order, includes, excludes, getApiStatus(getPeopleChainId(network))])

	// Handle modal resize on list format change
	useEffect(() => {
		maybeHandleModalResize()
	}, [effectiveListFormat, validators, page, stakingApiEnabled])

	// Compact viewports always use the full card. Keep listFormat untouched so the
	// user's preferred desktop layout is restored when the viewport grows again.
	useEffect(() => {
		const mediaQuery = window.matchMedia(CARD_LAYOUT_MEDIA_QUERY)
		const handleChange = (event: MediaQueryListEvent) => {
			setForceCardLayout(event.matches)
		}

		setForceCardLayout(mediaQuery.matches)
		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	if (!bootstrapped) {
		return (
			<div className="item">
				<h3>{t('fetchingValidators', { ns: 'pages' })}...</h3>
			</div>
		)
	}

	return (
		<ListWrapper>
			<List
				$flexBasisLarge={
					stakingApiEnabled ? '50%' : allowMoreCols ? '33.33%' : '50%'
				}
				$twoColumnMinWidth={stakingApiEnabled ? 1350 : undefined}
			>
				{allowSearch && (
					<SearchInput
						value={searchTerm ?? ''}
						handleChange={handleSearchChange}
						placeholder={t('searchAddress', { ns: 'app' })}
					/>
				)}
				<FilterHeaderWrapper>
					<div>{allowFilters && <FilterHeaders />}</div>
					<div>
						{allowListFormat && (
							<ListFormatToggle
								hideOnCompact={stakingApiEnabled}
								onChange={setListFormat}
								value={listFormat}
							/>
						)}
					</div>
				</FilterHeaderWrapper>
				{allowFilters && <FilterBadges />}
				{listItems.length > 0 && itemsPerPage && (
					<Pagination page={page} total={totalPages} setter={setPage} />
				)}
				{BeforeListNode}
				<MotionContainer>
					{listItems.length ? (
						listItems.map((validator) => (
							<motion.div
								key={`nomination_${validator.address}`}
								className={`item ${effectiveListFormat === 'row' ? 'row' : 'col'}`}
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
								<Item
									validator={validator}
									nominator={nominator}
									toggleFavorites={toggleFavorites}
									bondFor={bondFor}
									displayFor={displayFor}
									format={effectiveListFormat}
									eraPoints={performanceByAddress.get(validator.address) || []}
									rate={
										stakingApiEnabled
											? rateByAddress.get(validator.address)
											: rates[pageKey]?.[validator.address]
									}
									retainment={retainmentByAddress.get(validator.address)}
									isPreloading={detailsPreloading}
									nominationStatus={nominationStatus.current[validator.address]}
									onRemove={onRemove}
								/>
							</motion.div>
						))
					) : (
						<h4 style={{ marginTop: '1rem' }}>
							{isSearching
								? t('noValidatorsMatch', { ns: 'app' })
								: t('noValidators', { ns: 'app' })}
						</h4>
					)}
				</MotionContainer>
			</List>
		</ListWrapper>
	)
}

export const ValidatorList = (props: ValidatorListProps) => {
	const { selectable } = props
	return (
		<ListProvider selectable={selectable}>
			<ValidatorListInner {...props} />
		</ListProvider>
	)
}
