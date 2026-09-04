// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider, useList } from 'contexts/List'
import { useNetwork } from 'hooks/useNetwork'
import { FilterHeaderWrapper, List, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer, MotionItem } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { useForceCardLayout } from 'library/List/useForceCardLayout'
import { useOperatorList } from 'plugin-staking-api'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { ButtonSecondary } from 'ui-buttons'
import {
	Controls,
	DEFAULT_OPERATOR_LIST_CONFIG,
	type OperatorListConfig,
} from './Controls'
import { Item } from './Item'
import { ListStatus, ResultSummary } from './styles'

const PAGE_SIZE = 50

const StakingApiOperatorListInner = () => {
	const { t } = useTranslation('app')
	const { network } = useNetwork()
	const { listFormat, setListFormat } = useList()
	const [page, setPage] = useState(1)
	const [config, setConfig] = useState<OperatorListConfig>(
		DEFAULT_OPERATOR_LIST_CONFIG,
	)
	const forceCardLayout = useForceCardLayout()
	const effectiveListFormat = forceCardLayout ? 'col' : listFormat
	const variables = useMemo(
		() => ({
			network,
			order: config.order,
			page,
			pageSize: PAGE_SIZE,
			filters: { search: config.search || undefined },
		}),
		[network, config, page],
	)
	const { data, loading, error, refetch } = useOperatorList(variables)
	const result = data.operatorList
	const firstResult =
		result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1
	const lastResult = Math.min(result.page * result.pageSize, result.total)

	const applyConfig = (nextConfig: OperatorListConfig) => {
		setConfig(nextConfig)
		setPage(1)
	}

	return (
		<ListWrapper>
			<List $flexBasisLarge="50%" $twoColumnMinWidth={1350}>
				<Controls config={config} disabled={loading} onApply={applyConfig} />
				<FilterHeaderWrapper>
					<div>
						<ResultSummary>
							{loading
								? `${t('fetchingOperators')}...`
								: !error &&
									result.total > 0 &&
									t('operatorResultRange', {
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
				{!loading && !error && result.operators.length > 0 && (
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
						{result.operators.length > 0 ? (
							result.operators.map((operator) => (
								<MotionItem
									key={operator.identity.address}
									className={`item ${effectiveListFormat}`}
								>
									<Item operator={operator} format={effectiveListFormat} />
								</MotionItem>
							))
						) : (
							<ListStatus>
								<h4>{t('noOperatorsMatch')}</h4>
							</ListStatus>
						)}
					</MotionContainer>
				)}
			</List>
		</ListWrapper>
	)
}

export const StakingApiOperatorList = () => (
	<ListProvider initialListFormat="row">
		<StakingApiOperatorListInner />
	</ListProvider>
)
