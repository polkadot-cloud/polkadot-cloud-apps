// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { MaxPayoutDays } from 'consts'
import { isPoolShareEnabled } from 'consts/util'
import { useDataCapabilities, useDataGate } from 'data-gate/react'
import {
	combinedPoolRewards,
	poolRewardHistory,
	rewardHistory,
} from 'data-gate/resources/rewards'
import { getUnixTime, startOfToday, subDays } from 'date-fns'
import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { DataError } from 'library/DataError'
import type { RewardResults } from 'plugin-staking-api/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from 'ui-app/Card'
import { Page } from 'ui-core/base'
import { MAX_REWARD_PAGES, REWARD_ITEMS_PER_PAGE } from '../constants'
import type { RewardsKind } from '../types'
import { Inner } from './Inner'

interface PaginatedPayoutsProps {
	kind: RewardsKind
}

interface PayoutPage {
	payouts: RewardResults
	hasNext: boolean
	nextCursor?: string | null
}

// Renders a paginated list of payouts for a single source (nominator or pool). Each page is fetched
// on demand from the staking API and cached so that navigating between previously-loaded pages does
// not re-fetch.
export const PaginatedPayouts = ({ kind }: PaginatedPayoutsProps) => {
	const gate = useDataGate()
	const { t } = useTranslation('pages')
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { stakingApi: stakingApiEnabled } = useDataCapabilities()
	const { activePool } = useActivePool()
	const { activeAddress } = useActiveAccount()

	const apiEnabled = stakingApiEnabled
	const poolShareEnabled = isPoolShareEnabled(network, activePool?.id)

	// Current page (1-indexed)
	const [page, setPage] = useState<number>(1)

	// Cache of fetched pages, keyed by page number
	const [pages, setPages] = useState<Record<number, PayoutPage>>({})

	// Whether the current page request is in flight
	const [error, setError] = useState(false)
	const [retry, setRetry] = useState(0)
	const [loading, setLoading] = useState<boolean>(false)

	// Reset cache + page state when the underlying source changes
	useEffect(() => {
		setPage(1)
		setPages({})
	}, [gate, activeAddress, kind, apiEnabled, poolShareEnabled])

	const fetchPage = useCallback(
		async (targetPage: number): Promise<PayoutPage> => {
			const offset = (targetPage - 1) * REWARD_ITEMS_PER_PAGE
			let payouts: RewardResults
			if (kind === 'nominator') {
				const { allRewards } = await gate.request(
					rewardHistory({
						who: activeAddress || '',
						fromEra: Math.max(activeEra.index - 1, 0),
						limit: REWARD_ITEMS_PER_PAGE,
						offset: offset,
					}),
				)
				payouts = allRewards as RewardResults
			} else {
				if (poolShareEnabled) {
					const after =
						targetPage > 1 ? pages[targetPage - 1]?.nextCursor : undefined
					const {
						combinedPoolRewards: { entries, hasNextPage, nextCursor },
					} = await gate.request(
						combinedPoolRewards({
							who: activeAddress || '',
							first: REWARD_ITEMS_PER_PAGE,
							after: after ?? undefined,
						}),
					)
					payouts = entries as RewardResults
					return {
						payouts,
						hasNext: hasNextPage && targetPage < MAX_REWARD_PAGES,
						nextCursor,
					}
				}

				const fromDate = subDays(startOfToday(), MaxPayoutDays)
				const { poolRewards } = await gate.request(
					poolRewardHistory({
						who: activeAddress || '',
						from: getUnixTime(fromDate),
						limit: REWARD_ITEMS_PER_PAGE,
						offset: offset,
					}),
				)
				payouts = poolRewards as RewardResults
			}

			return {
				payouts,
				hasNext:
					payouts.length === REWARD_ITEMS_PER_PAGE &&
					targetPage < MAX_REWARD_PAGES,
			}
		},
		[gate, activeAddress, activeEra.index, kind, pages, poolShareEnabled],
	)

	// Fetch the current page on demand (cache miss)
	useEffect(() => {
		if (!apiEnabled || !activeAddress || activeEra.index <= 0) {
			return
		}
		if (pages[page] !== undefined) {
			return
		}
		let cancelled = false
		setLoading(true)
		setError(false)
		fetchPage(page)
			.then((data) => {
				if (cancelled) {
					return
				}
				setPages((prev) => ({ ...prev, [page]: data }))
			})
			.catch(() => {
				if (!cancelled) setError(true)
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false)
				}
			})
		return () => {
			cancelled = true
		}
	}, [
		page,
		pages,
		apiEnabled,
		activeAddress,
		activeEra.index,
		fetchPage,
		retry,
	])

	const pageData = pages[page]
	const payouts = pageData?.payouts ?? []
	const endOfResults =
		pageData !== undefined &&
		payouts.length > 0 &&
		(page === MAX_REWARD_PAGES || !pageData.hasNext)

	const title =
		kind === 'nominator'
			? t('payouts', { ns: 'app' })
			: t('poolClaim', { count: 2, ns: 'app' })

	return (
		<Page.Row>
			<CardWrapper>
				{error && <DataError retry={() => setRetry((value) => value + 1)} />}
				<Inner
					title={title}
					payouts={payouts}
					endBadge={endOfResults ? t('endOfResults', { ns: 'app' }) : undefined}
					pagination
					itemsPerPage={REWARD_ITEMS_PER_PAGE}
					loading={loading}
					remotePagination={{
						page,
						setPage,
						hasNext: pageData?.hasNext ?? false,
					}}
				/>
			</CardWrapper>
		</Page.Row>
	)
}

// Convenience wrappers for the two reward sources
export const NominatorPayouts = () => <PaginatedPayouts kind="nominator" />
export const PoolPayouts = () => <PaginatedPayouts kind="pool" />
