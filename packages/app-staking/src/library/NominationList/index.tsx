// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { ListProvider, useList } from 'contexts/List'
import {
	useNomineeStatuses,
	useValidatorOverviews,
	useValidatorRewardRates,
} from 'data-gate'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useValidatorDetailsEnabled } from 'hooks/useValidatorDetailsEnabled'
import { useValidatorWarnings } from 'hooks/useValidatorWarnings'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { EMPTY_ERA_POINTS } from 'library/List/Utils'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ListItem } from 'ui-app/ListItem'
import { useOverlay } from 'ui-overlay'
import { injectValidatorListData } from '../ValidatorList/overview'
import { Item } from './Item'
import type { NominationListProps } from './types'

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
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const validatorDetailsEnabled = useValidatorDetailsEnabled()
	const { listFormat, setListFormat } = useList()
	const { activeEra } = useApi()
	const { activeAddress } = useActiveAccount()
	const { setModalResize } = useOverlay().modal
	const { data: overviews } = useValidatorOverviews(
		initialValidators.map(({ address }) => address),
		validatorDetailsEnabled,
	)
	const nominator = initialNominator || activeAddress
	const {
		data: nominees,
		loading: nominationsPreloading,
		error: nominationError,
	} = useNomineeStatuses(
		nominator,
		initialValidators.map(({ address }) => address),
	)
	const nomineesByAddress = useMemo(
		() => new Map(nominees?.map((entry) => [entry.address, entry])),
		[nominees],
	)
	// Sorting and both card layouts use the same source-selected snapshot.
	const validators = useMemo(() => {
		const rank = (address: string) => {
			const status = nomineesByAddress.get(address)?.status
			return status === 'active' ? 2 : status === 'inactive' ? 1 : 0
		}
		return injectValidatorListData(initialValidators, overviews).sort(
			(a, b) => rank(b.address) - rank(a.address),
		)
	}, [initialValidators, nomineesByAddress, overviews])

	const forceCardLayout = useForceCardLayout()
	const effectiveListFormat =
		validatorDetailsEnabled && forceCardLayout ? 'col' : listFormat

	// Store all API-backed detailed card data by request key.
	const [detailsByKey, setDetailsByKey] = useState<
		Record<string, ValidatorDetailsBatchData>
	>({})

	const addresses = useMemo(
		() => validators.map(({ address }) => address),
		[validators],
	)
	const { warnings } = useValidatorWarnings(
		network,
		addresses,
		retainmentStatsEnabled,
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
				includeRetainment: retainmentStatsEnabled,
				validators: addresses,
			}),
		[network, activeEra.index, erasPerDay, addresses, retainmentStatsEnabled],
	)
	const details = detailsByKey[detailsKey]
	const detailsPreloading =
		validatorDetailsEnabled && validators.length > 0 && details === undefined
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
	const { data: rates } = useValidatorRewardRates(
		addresses,
		erasPerDay,
		!validatorDetailsEnabled,
	)

	// Fetch all data needed by supported detailed nomination cards in one GraphQL operation.
	const getDetailedData = async (key: string) => {
		if (
			!validatorDetailsEnabled ||
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
			{ includeRetainment: retainmentStatsEnabled },
		)
		setDetailsByKey((current) => ({ ...current, [key]: results }))
	}

	// Fetch detailed card data when the visible validator set changes.
	useEffect(() => {
		getDetailedData(detailsKey)
	}, [detailsKey, validatorDetailsEnabled])

	// Handle modal resize on list format or content change
	useEffect(() => {
		maybeHandleModalResize()
	}, [effectiveListFormat, pageKey, validatorDetailsEnabled])

	return (
		<ListWrapper>
			<List
				$flexBasisLarge={validatorDetailsEnabled ? '50%' : '33.33%'}
				$twoColumnMinWidth={validatorDetailsEnabled ? 1350 : undefined}
			>
				<ListFormatHeader>
					<div />
					<div>
						{!(validatorDetailsEnabled && forceCardLayout) && (
							<ListItem.FormatToggle
								onChange={setListFormat}
								value={listFormat}
							/>
						)}
					</div>
				</ListFormatHeader>
				<MotionContainer>
					{validators.length ? (
						validators.map((validator) => (
							<MotionItem
								key={`nomination_${validator.address}`}
								className={`item ${effectiveListFormat === 'row' ? 'row' : 'col'}`}
							>
								<Item
									validator={validator}
									nominator={nominator}
									toggleFavorites={toggleFavorites}
									bondFor={bondFor}
									displayFor={displayFor}
									format={effectiveListFormat}
									eraPoints={
										performanceByAddress.get(validator.address) ||
										EMPTY_ERA_POINTS
									}
									isPreloading={detailsPreloading}
									rate={
										validatorDetailsEnabled
											? rateByAddress.get(validator.address)
											: rates?.[validator.address]
									}
									retainment={retainmentByAddress.get(validator.address)}
									warnings={warnings[validator.address]}
									nominee={nomineesByAddress.get(validator.address)}
									nominationError={!!nominationError}
									isNominationPreloading={nominationsPreloading}
								/>
							</MotionItem>
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
