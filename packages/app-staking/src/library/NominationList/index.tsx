// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { ListProvider, useList } from 'contexts/List'
import type { ValidatorListEntry } from 'contexts/Validators/types'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useNominationStatus } from 'hooks/useNominationStatus'
import { usePlugins } from 'hooks/usePlugins'
import { useSyncing } from 'hooks/useSyncing'
import { useValidatorRewardRateBatch } from 'hooks/useValidatorRewardRateBatch'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { motion } from 'motion/react'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import type { NominationStatus } from 'types'
import { ListFormatToggle } from 'ui-app/ListItem'
import { useOverlay } from 'ui-overlay'
import { Item } from './Item'
import type { NominationListProps } from './types'

const CARD_LAYOUT_MEDIA_QUERY = '(max-width: 1199px)'

const ListFormatHeader = styled(FilterHeaderWrapper)`
  margin-top: 0.75rem;
`

export const NominationListInner = ({
	// Default list values.
	nominator: initialNominator,
	validators: initialValidators,
	// Validator list config options.
	bondFor,
	toggleFavorites,
	displayFor = 'default',
}: NominationListProps) => {
	const { t } = useTranslation('app')
	const { syncing } = useSyncing()
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { pluginEnabled } = usePlugins()
	const stakingApiEnabled = pluginEnabled('staking_api')
	const { listFormat, setListFormat } = useList()
	const { isReady, activeEra } = useApi()
	const { activeAddress } = useActiveAccount()
	const { setModalResize } = useOverlay().modal
	const { injectValidatorListData } = useValidators()
	const { getNominationSetStatus, getPoolNominationStatus } =
		useNominationStatus()

	// Determine the nominator of the list. Fallback to activeAddress if not provided
	const nominator = initialNominator || activeAddress

	// Store the current nomination status of validator records relative to the supplied nominator
	const nominationStatus = useRef<Record<string, NominationStatus>>({})

	// Get nomination status relative to supplied nominator
	const processNominationStatus = () => {
		if (bondFor === 'pool') {
			nominationStatus.current = initialValidators.reduce(
				(acc: Record<string, NominationStatus>, { address }) => {
					acc[address] = getPoolNominationStatus(nominator, address)
					return acc
				},
				{},
			)
		} else {
			// get all active account's nominations
			const nominationStatuses = getNominationSetStatus(nominator, 'nominator')

			// find the nominator status within the returned nominations
			nominationStatus.current = Object.fromEntries(
				initialValidators.map(({ address }) => [
					address,
					nominationStatuses[address],
				]),
			)
		}
	}

	// Injects status into supplied initial validators
	const prepareInitialValidators = () => {
		processNominationStatus()
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

	// Manipulated list (custom ordering, filtering) of validators
	const [validators, setValidators] = useState<ValidatorListEntry[]>(() =>
		prepareInitialValidators(),
	)

	// Store whether the list has been fetched initially
	const [fetched, setFetched] = useState<boolean>(false)
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

	const addresses = useMemo(
		() => validators.map(({ address }) => address),
		[validators],
	)
	const pageKey = useMemo(
		() => JSON.stringify(addresses.map((address, i) => `${i}${address}`)),
		[addresses],
	)
	const detailsKey = useMemo(
		() =>
			JSON.stringify({
				network,
				era: activeEra.index,
				rewardRateDepth: erasPerDay,
				validators: addresses,
			}),
		[network, activeEra.index, erasPerDay, addresses],
	)
	const details = detailsByKey[detailsKey]
	const detailsPreloading =
		stakingApiEnabled && validators.length > 0 && details === undefined
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

	// If in modal, handle resize
	const maybeHandleModalResize = () => {
		if (displayFor === 'modal') {
			setModalResize()
		}
	}

	// Get validator reward rates
	const { rates } = useValidatorRewardRateBatch(
		addresses,
		pageKey,
		stakingApiEnabled,
	)

	// Handle list bootstrapping
	const setupValidatorList = () => {
		setValidators(prepareInitialValidators())
		setFetched(true)
	}

	// Fetch all data needed by detailed nomination cards in one GraphQL operation.
	const getDetailedData = async (key: string) => {
		if (
			!stakingApiEnabled ||
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
		setDetailsByKey((current) => ({ ...current, [key]: results }))
	}

	// Reset list when list changes
	useEffect(() => {
		setFetched(false)
	}, [initialValidators, nominator])

	// Fetch detailed card data when the visible validator set changes.
	useEffect(() => {
		getDetailedData(detailsKey)
	}, [detailsKey, stakingApiEnabled])

	// Configure list when network is ready to fetch
	useEffect(() => {
		if (isReady && activeEra.index > 0) {
			setupValidatorList()
		}
	}, [isReady, activeEra.index, syncing, fetched])

	// Handle modal resize on list format or content change
	useEffect(() => {
		maybeHandleModalResize()
	}, [effectiveListFormat, validators, stakingApiEnabled])

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

	return (
		<ListWrapper>
			<List
				$flexBasisLarge={stakingApiEnabled ? '50%' : '33.33%'}
				$twoColumnMinWidth={stakingApiEnabled ? 1350 : undefined}
			>
				<ListFormatHeader>
					<div />
					<div>
						<ListFormatToggle
							hideOnCompact={stakingApiEnabled}
							onChange={setListFormat}
							value={listFormat}
						/>
					</div>
				</ListFormatHeader>
				<MotionContainer>
					{validators.length ? (
						validators.map((validator) => (
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
									isPreloading={detailsPreloading}
									rate={
										stakingApiEnabled
											? rateByAddress.get(validator.address)
											: rates[pageKey]?.[validator.address]
									}
									retainment={retainmentByAddress.get(validator.address)}
									nominationStatus={nominationStatus.current[validator.address]}
								/>
							</motion.div>
						))
					) : (
						<h4 style={{ marginTop: '1rem' }}>{t('noValidators')}</h4>
					)}
				</MotionContainer>
			</List>
		</ListWrapper>
	)
}

export const NominationList = (props: NominationListProps) => (
	<ListProvider>
		<NominationListInner {...props} />
	</ListProvider>
)
