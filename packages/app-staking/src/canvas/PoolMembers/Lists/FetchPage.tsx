// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useDataResource } from 'data-gate/react'
import {
	poolMembers as memberPage,
	poolMemberDetails,
} from 'data-gate/resources/pools'
import { DataError } from 'library/DataError'
import { List, ListStatusHeader, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Member } from './Member'
import type { MembersListProps } from './types'

export const MembersListInner = ({
	bondedPool,
	pagination,
	memberCount,
	itemsPerPage,
	isDepositor,
	isRoot,
	isOwner,
	isBouncer,
}: MembersListProps) => {
	const { t } = useTranslation('pages')

	const poolId = bondedPool.id

	// current page
	const [page, setPage] = useState<number>(1)

	// pagination
	const totalPages = Math.ceil(Number(memberCount) / itemsPerPage)

	const memberResult = useDataResource(
		memberPage(poolId, itemsPerPage, (page - 1) * itemsPerPage),
	)
	const details = useDataResource(
		poolMemberDetails(
			memberResult.data?.poolMembers.members.map(({ address }) => address) ??
				[],
			memberResult.data !== undefined,
		),
	)
	const listMembers = details.data ?? []
	const loading = memberResult.loading || details.loading
	const error = memberResult.error || details.error

	return (
		<ListWrapper>
			{error && (
				<DataError
					retry={() => {
						void memberResult.refresh()
						void details.refresh()
					}}
				/>
			)}
			<List $flexBasisLarge={'33.33%'}>
				{pagination && (
					<Pagination
						page={page}
						total={totalPages}
						setter={setPage}
						disabled={loading}
					/>
				)}
				{loading ? (
					<ListStatusHeader style={{ marginTop: '0.5rem' }}>
						{t('fetchingMemberList')}....
					</ListStatusHeader>
				) : (
					<MotionContainer>
						{listMembers.map((member) => (
							<Member
								key={`pool_member_${member.address}`}
								member={member}
								bondedPool={bondedPool}
								isDepositor={isDepositor}
								isRoot={isRoot}
								isOwner={isOwner}
								isBouncer={isBouncer}
							/>
						))}
					</MotionContainer>
				)}
			</List>
		</ListWrapper>
	)
}

export const MembersList = (props: MembersListProps) => (
	<ListProvider>
		<MembersListInner {...props} />
	</ListProvider>
)
