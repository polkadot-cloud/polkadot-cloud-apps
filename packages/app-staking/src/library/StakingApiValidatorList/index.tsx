// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider, useList } from 'contexts/List'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import {
	fetchValidatorAvgRewardRateBatch,
	fetchValidatorEraPointsBatch,
	useValidatorList,
} from 'plugin-staking-api'
import type {
	ValidatorEraPoints,
	ValidatorListOrder,
} from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { ButtonSecondary } from 'ui-buttons'
import {
	Controls,
	DEFAULT_VALIDATOR_LIST_CONFIG,
	type ValidatorListConfig,
} from './Controls'
import { Item } from './Item'
import { ListStatus, ResultSummary } from './styles'

const PAGE_SIZE = 50
const ERA_POINTS_DEPTH = 30
interface StakingApiValidatorListProps {
	showShareLink?: boolean
	toggleFavorites?: boolean
}

export const StakingApiValidatorListInner = ({
	showShareLink = true,
	toggleFavorites = true,
}: StakingApiValidatorListProps) => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { listFormat, setListFormat } = useList()
	const [page, setPage] = useState(1)
	const forceCardLayout = useForceCardLayout()
	const [config, setConfig] = useState<ValidatorListConfig>(
		DEFAULT_VALIDATOR_LIST_CONFIG,
	)
	const [eraPointsByAddress, setEraPointsByAddress] = useState<
		Map<string, ValidatorEraPoints[]>
	>(new Map())
	const [rateByAddress, setRateByAddress] = useState<Map<string, number>>(
		new Map(),
	)
	const [isEraPointsLoading, setIsEraPointsLoading] = useState(false)
	const [isRateLoading, setIsRateLoading] = useState(false)
	const effectiveListFormat = forceCardLayout ? 'col' : listFormat

	const variables = useMemo(
		() => ({
			network,
			page,
			pageSize: PAGE_SIZE,
			order: config.order as ValidatorListOrder,
			filters: {
				...config.filters,
				search: config.search || undefined,
			},
		}),
		[network, page, config],
	)
	const { data, loading, error, refetch } = useValidatorList(variables)
	const result = data.validatorList
	const historyFromEra =
		result.activityEra === null ? null : Math.max(result.activityEra - 1, 0)
	const addresses = useMemo(
		() => result.validators.map(({ address }) => address),
		[result.validators],
	)
	const detailsKey = useMemo(
		() =>
			JSON.stringify({
				addresses,
				activityEra: result.activityEra,
				network,
			}),
		[addresses, result.activityEra, network],
	)

	// The page query resolves first. Only then do the two independent enrichment requests begin.
	useEffect(() => {
		setEraPointsByAddress(new Map())
		setRateByAddress(new Map())

		if (loading || addresses.length === 0 || historyFromEra === null) {
			setIsEraPointsLoading(false)
			setIsRateLoading(false)
			return
		}

		let cancelled = false
		setIsEraPointsLoading(true)
		setIsRateLoading(true)

		void fetchValidatorEraPointsBatch(
			network,
			addresses,
			historyFromEra,
			ERA_POINTS_DEPTH,
		).then(({ validatorEraPointsBatch }) => {
			if (!cancelled) {
				setEraPointsByAddress(
					new Map(
						validatorEraPointsBatch.map(({ validator, points }) => [
							validator,
							points,
						]),
					),
				)
				setIsEraPointsLoading(false)
			}
		})

		void fetchValidatorAvgRewardRateBatch(
			network,
			addresses,
			historyFromEra,
			erasPerDay,
		).then(({ validatorAvgRewardRateBatch }) => {
			if (!cancelled) {
				setRateByAddress(
					new Map(
						validatorAvgRewardRateBatch.map(({ validator, rate }) => [
							validator,
							rate,
						]),
					),
				)
				setIsRateLoading(false)
			}
		})

		return () => {
			cancelled = true
		}
	}, [detailsKey, loading, erasPerDay])

	const applyConfig = (nextConfig: ValidatorListConfig) => {
		setConfig(nextConfig)
		setPage(1)
	}

	const firstResult =
		result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1
	const lastResult = Math.min(result.page * result.pageSize, result.total)

	return (
		<ListWrapper>
			<List $flexBasisLarge="50%" $twoColumnMinWidth={1350}>
				<Controls config={config} disabled={loading} onApply={applyConfig} />
				<FilterHeaderWrapper>
					<div>
						<ResultSummary>
							{loading
								? `${t('fetchingValidators', { ns: 'pages' })}...`
								: !error &&
									result.total > 0 &&
									t('validatorResultRange', {
										first: firstResult,
										last: lastResult,
										total: result.total,
									})}
						</ResultSummary>
					</div>
					<div>
						{!forceCardLayout && (
							<ListItem.FormatToggle
								onChange={setListFormat}
								value={listFormat}
							/>
						)}
					</div>
				</FilterHeaderWrapper>
				{!loading && !error && result.validators.length > 0 && (
					<Pagination
						page={result.page}
						total={result.totalPages}
						hasNext={result.hasNextPage}
						setter={setPage}
					/>
				)}
				{error ? (
					<ListStatus>
						<h4>{t('errorUnknown')}</h4>
						<ButtonSecondary
							text={t('tryAgain')}
							onClick={() => {
								void refetch()
							}}
						/>
					</ListStatus>
				) : loading ? null : (
					<MotionContainer>
						{result.validators.length > 0 ? (
							result.validators.map((validator) => (
								<MotionItem
									key={validator.address}
									className={`item ${effectiveListFormat}`}
								>
									<Item
										validator={validator}
										format={effectiveListFormat}
										totalActive={result.totalActive}
										eraPoints={eraPointsByAddress.get(validator.address) ?? []}
										rate={rateByAddress.get(validator.address)}
										isEraPointsLoading={isEraPointsLoading}
										isRateLoading={isRateLoading}
										showShareLink={showShareLink}
										toggleFavorites={toggleFavorites}
									/>
								</MotionItem>
							))
						) : (
							<ListStatus>
								<h4>{t('noValidatorsMatch')}</h4>
							</ListStatus>
						)}
					</MotionContainer>
				)}
			</List>
		</ListWrapper>
	)
}

export const StakingApiValidatorList = (
	props: StakingApiValidatorListProps,
) => (
	<ListProvider initialListFormat="row">
		<StakingApiValidatorListInner {...props} />
	</ListProvider>
)
