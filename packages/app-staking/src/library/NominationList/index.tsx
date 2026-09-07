// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { ListProvider, useList } from 'contexts/List'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useNominationStatuses, useValidatorDetails } from 'data-gate/react'
import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { useValidatorRewardRateBatch } from 'hooks/useValidatorRewardRateBatch'
import { DataError } from 'library/DataError'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ListItem } from 'ui-app/ListItem'
import { useOverlay } from 'ui-overlay'
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
	const retainmentStatsEnabled = useRetainmentStatsEnabled()
	const { listFormat, setListFormat } = useList()
	const { activeAddress } = useActiveAccount()
	const { setModalResize } = useOverlay().modal
	const { injectValidatorListData } = useValidators()
	const nominator = initialNominator || activeAddress
	const statusResult = useNominationStatuses(
		nominator,
		initialValidators.map(({ address }) => address),
	)
	const nominationStatus = statusResult.data ?? {}
	const statusToIndex = { active: 2, inactive: 1, waiting: 0 }
	const validators = useMemo(
		() =>
			injectValidatorListData(initialValidators).sort(
				(a, b) =>
					(statusToIndex[nominationStatus[b.address]] ?? -1) -
					(statusToIndex[nominationStatus[a.address]] ?? -1),
			),
		[initialValidators, statusResult.data, injectValidatorListData],
	)
	const forceCardLayout = useForceCardLayout()
	const effectiveListFormat =
		retainmentStatsEnabled && forceCardLayout ? 'col' : listFormat

	const addresses = validators.map(({ address }) => address)
	const pageKey = JSON.stringify(addresses)
	const detailsResult = useValidatorDetails(addresses, retainmentStatsEnabled)
	const details = detailsResult.data
	const detailsPreloading = detailsResult.loading
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
		retainmentStatsEnabled ? 'none' : 'auto',
	)

	// Handle modal resize on list format or content change
	useEffect(() => {
		maybeHandleModalResize()
	}, [effectiveListFormat, validators, retainmentStatsEnabled])

	return (
		<ListWrapper>
			{statusResult.error && (
				<DataError
					retry={() => {
						void statusResult.refresh()
					}}
				/>
			)}
			<List
				$flexBasisLarge={retainmentStatsEnabled ? '50%' : '33.33%'}
				$twoColumnMinWidth={retainmentStatsEnabled ? 1350 : undefined}
			>
				<ListFormatHeader>
					<div />
					<div>
						{!(retainmentStatsEnabled && forceCardLayout) && (
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
									eraPoints={performanceByAddress.get(validator.address) || []}
									isPreloading={detailsPreloading}
									rate={
										retainmentStatsEnabled
											? rateByAddress.get(validator.address)
											: rates[pageKey]?.[validator.address]
									}
									retainment={retainmentByAddress.get(validator.address)}
									nominationStatus={nominationStatus[validator.address]}
									nominationStatusLoading={statusResult.loading}
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
