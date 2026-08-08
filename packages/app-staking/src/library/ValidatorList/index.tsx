// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider, useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useSyncing } from 'hooks/useSyncing'
import { useValidatorRewardRateBatch } from 'hooks/useValidatorRewardRateBatch'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import {
	Controls,
	type ValidatorListConfig,
} from 'library/StakingApiValidatorList/Controls'
import { ResultSummary } from 'library/StakingApiValidatorList/styles'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { useOverlay } from 'ui-overlay'
import { useValidatorFilters } from '../../hooks/useValidatorFilters'
import { Item } from './Item'
import type { ValidatorListProps } from './types'

const DEFAULT_CONFIG: ValidatorListConfig = {
	filters: {
		activeOnly: false,
		excludeBlocked: false,
		excludeMissingIdentity: false,
	},
	order: 'default',
	search: '',
}

interface ValidatorDetailsCacheEntry {
	addresses: string[]
	data: ValidatorDetailsBatchData
	scopeKey: string
}

export const ValidatorListInner = ({
	// Default list values.
	validators: initialValidators,
	// Validator list config options.
	toggleFavorites,
	itemsPerPage,
	displayFor = 'default',
	allowListFormat = true,
	forceListFormat,
	defaultConfig,
	BeforeListNode = null,
	onRemove,
}: ValidatorListProps) => {
	const { t } = useTranslation()
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { setModalResize } = useOverlay().modal
	const { injectValidatorListData } = useValidators()
	const { isReady, activeEra } = useApi()
	const { applyConfig } = useValidatorFilters()
	const {
		selectable,
		listFormat,
		setListFormat,
		pagination: { page, setPage },
	} = useList()
	const showControls = displayFor === 'default' && !selectable
	const [config, setConfig] = useState(() => defaultConfig ?? DEFAULT_CONFIG)
	const controlsOrderOptions = [
		{ key: 'ACTIVITY', label: t('activity', { ns: 'app' }) },
		{ key: 'default', label: t('unordered', { ns: 'app' }) },
	]

	const validatorsDefault = useMemo(
		() => injectValidatorListData(initialValidators),
		[initialValidators, injectValidatorListData],
	)
	const validators = useMemo<ValidatorListEntry[]>(
		() =>
			showControls
				? applyConfig(config, [...validatorsDefault])
				: validatorsDefault,
		[applyConfig, config, showControls, validatorsDefault],
	)

	const forceCardLayout = useForceCardLayout()
	const effectiveListFormat =
		forceListFormat ??
		(retainmentStatsEnabled && forceCardLayout ? 'col' : listFormat)

	// Cache API-backed details by the visible validator set and era.
	const [detailsByKey, setDetailsByKey] = useState<
		Record<string, ValidatorDetailsCacheEntry>
	>({})

	// Pagination
	const pageLength: number = itemsPerPage || validators.length
	const totalPages = Math.ceil(validators.length / pageLength)
	const pageEnd = page * pageLength - 1
	const pageStart = pageEnd - (pageLength - 1)
	const firstResult = validators.length === 0 ? 0 : pageStart + 1
	const lastResult = Math.min(pageStart + pageLength, validators.length)

	// Get subset for page display.
	const listItems = useMemo(
		() => validators.slice(pageStart, pageStart + pageLength),
		[validators, pageStart, pageLength],
	)

	const pageKey = useMemo(() => {
		const itemKeys = listItems
			.map(({ address }, i) => `${i}${address}`)
			.join(',')
		return `${itemKeys}|${showControls ? JSON.stringify(config) : ''}`
	}, [config, listItems, showControls])
	const detailsScopeKey = useMemo(
		() =>
			JSON.stringify({
				network,
				era: activeEra.index,
				rewardRateDepth: erasPerDay,
			}),
		[network, activeEra.index, erasPerDay],
	)
	const scopedDetails = useMemo(
		() =>
			Object.values(detailsByKey).filter(
				({ scopeKey }) => scopeKey === detailsScopeKey,
			),
		[detailsByKey, detailsScopeKey],
	)
	const detailedAddresses = useMemo(
		() => new Set(scopedDetails.flatMap(({ addresses }) => addresses)),
		[scopedDetails],
	)
	const pendingDetailedAddresses = useMemo(
		() =>
			listItems
				.map(({ address }) => address)
				.filter((address) => !detailedAddresses.has(address)),
		[listItems, detailedAddresses],
	)
	const detailsKey = useMemo(
		() =>
			JSON.stringify({
				scopeKey: detailsScopeKey,
				validators: pendingDetailedAddresses,
			}),
		[detailsScopeKey, pendingDetailedAddresses],
	)
	const eraPointsByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorEraPointsBatch.map(
						(entry) => [entry.validator, entry.points] as const,
					),
				),
			),
		[scopedDetails],
	)
	const rateByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorAvgRewardRateBatch.map(
						(entry) => [entry.validator, entry.rate] as const,
					),
				),
			),
		[scopedDetails],
	)
	const retainmentByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorRetainmentBatch.map(
						(entry) => [entry.validator, entry.result] as const,
					),
				),
			),
		[scopedDetails],
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
		retainmentStatsEnabled ? 'none' : 'node',
	)

	const getDetailedData = async (key: string, addresses: string[]) => {
		if (
			!retainmentStatsEnabled ||
			activeEra.index === 0 ||
			addresses.length === 0 ||
			detailsByKey[key] !== undefined
		) {
			return
		}

		const results = await fetchValidatorDetailsBatch(
			network,
			addresses,
			Math.max(activeEra.index - 1, 0),
			erasPerDay,
			30,
		)
		setDetailsByKey((current) => ({
			...current,
			[key]: { addresses, data: results, scopeKey: detailsScopeKey },
		}))
	}

	// Fetch detailed data only where staking API retainment stats are supported.
	useEffect(() => {
		void getDetailedData(detailsKey, pendingDetailedAddresses)
	}, [detailsKey, retainmentStatsEnabled])

	const setControls = (nextConfig: ValidatorListConfig) => {
		setConfig(nextConfig)
		setPage(1)
	}

	// Handle modal resize on list format change
	useEffect(() => {
		maybeHandleModalResize()
	}, [effectiveListFormat, validators, page, retainmentStatsEnabled])

	return (
		<ListWrapper>
			<List
				$flexBasisLarge={retainmentStatsEnabled ? '50%' : '33.33%'}
				$twoColumnMinWidth={retainmentStatsEnabled ? 1350 : undefined}
			>
				{showControls && (
					<Controls
						config={config}
						disabled={!isReady || activeEra.index === 0 || syncing}
						onApply={setControls}
						orderOptions={controlsOrderOptions}
					/>
				)}
				{(showControls || allowListFormat) && (
					<FilterHeaderWrapper>
						<div>
							{showControls && validators.length > 0 && (
								<ResultSummary>
									{t('validatorResultRange', {
										ns: 'app',
										first: firstResult,
										last: lastResult,
										total: validators.length,
									})}
								</ResultSummary>
							)}
						</div>
						<div>
							{allowListFormat && (
								<ListItem.FormatToggle
									hideOnCompact={retainmentStatsEnabled}
									onChange={setListFormat}
									value={listFormat}
								/>
							)}
						</div>
					</FilterHeaderWrapper>
				)}
				{listItems.length > 0 && itemsPerPage && (
					<Pagination page={page} total={totalPages} setter={setPage} />
				)}
				{BeforeListNode}
				<MotionContainer>
					{listItems.length ? (
						listItems.map((validator) => (
							<MotionItem
								key={`nomination_${validator.address}`}
								className={`item ${effectiveListFormat === 'row' ? 'row' : 'col'}`}
							>
								<Item
									validator={validator}
									toggleFavorites={toggleFavorites}
									displayFor={displayFor}
									format={effectiveListFormat}
									eraPoints={eraPointsByAddress.get(validator.address) ?? []}
									rate={
										retainmentStatsEnabled
											? rateByAddress.get(validator.address)
											: rates[pageKey]?.[validator.address]
									}
									retainment={retainmentByAddress.get(validator.address)}
									isPreloading={
										retainmentStatsEnabled &&
										activeEra.index > 0 &&
										!detailedAddresses.has(validator.address)
									}
									onRemove={onRemove}
								/>
							</MotionItem>
						))
					) : (
						<h4 style={{ marginTop: '1rem' }}>
							{config.search
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
	const { forceListFormat, selectable } = props
	return (
		<ListProvider
			selectable={selectable}
			initialListFormat={forceListFormat ?? 'row'}
		>
			<ValidatorListInner {...props} />
		</ListProvider>
	)
}
