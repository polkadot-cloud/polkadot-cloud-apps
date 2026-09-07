// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider, useList } from 'contexts/List'
import { useDataResource, useValidatorList } from 'data-gate/react'
import {
	validatorEraPoints,
	validatorRewardRates,
} from 'data-gate/resources/performance'
import { useNetwork } from 'hooks/useNetwork'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import type {
	ValidatorListOrder,
	ValidatorListVariables,
} from 'plugin-staking-api/types'
import { useMemo, useState } from 'react'
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
	const { listFormat, setListFormat } = useList()
	const [page, setPage] = useState(1)
	const forceCardLayout = useForceCardLayout()
	const [config, setConfig] = useState<ValidatorListConfig>(
		DEFAULT_VALIDATOR_LIST_CONFIG,
	)
	const effectiveListFormat = forceCardLayout ? 'col' : listFormat

	const variables = useMemo<ValidatorListVariables>(
		() => ({
			network,
			page,
			pageSize: PAGE_SIZE,
			order: config.order as ValidatorListOrder,
			orderWindow: 'THREE_MONTHS',
			retainmentWindows: ['ONE_MONTH', 'THREE_MONTHS'],
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
	const pointsResult = useDataResource(
		validatorEraPoints(
			addresses,
			historyFromEra ?? 0,
			ERA_POINTS_DEPTH,
			!loading && historyFromEra !== null,
		),
	)
	const ratesResult = useDataResource(
		validatorRewardRates(
			addresses,
			!loading && historyFromEra !== null,
			historyFromEra ?? undefined,
		),
	)
	const eraPointsByAddress = new Map(
		(pointsResult.data?.validatorEraPointsBatch ?? []).map(
			({ validator, points }) => [validator, points],
		),
	)
	const rateByAddress = new Map(
		(ratesResult.data?.validatorAvgRewardRateBatch ?? []).map(
			({ validator, rate }) => [validator, rate],
		),
	)
	const isEraPointsLoading = pointsResult.loading
	const isRateLoading = ratesResult.loading

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
