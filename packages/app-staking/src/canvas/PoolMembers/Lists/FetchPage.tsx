// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useNetwork } from 'hooks/useNetwork'
import { usePoolMembers } from 'hooks/usePoolMembers'
import { List, ListStatusHeader, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { Member } from './Member'
import type { MembersListProps } from './types'

export const MembersListInner = ({
	bondedPool,
	pagination,
	itemsPerPage,
	isRoot,
	isOwner,
	isBouncer,
}: MembersListProps) => {
	const { t } = useTranslation('pages')
	const [page, setPage] = useState(1)
	const { data, isPending, isFetching, error, refetch } = usePoolMembers(
		bondedPool.id,
		page,
		itemsPerPage,
	)
	const totalPages = data
		? Math.max(1, Math.ceil(data.totalMembers / itemsPerPage))
		: page

	// The last page can disappear after members leave the pool.
	useEffect(() => {
		if (data && page > totalPages) setPage(totalPages)
	}, [data, page, totalPages])

	return (
		<ListWrapper>
			<List $flexBasisLarge={'33.33%'}>
				{pagination && (
					<Pagination
						page={page}
						total={totalPages}
						setter={setPage}
						disabled={isPending}
					/>
				)}
				{error ? (
					<ListStatusHeader style={{ marginTop: '0.5rem' }}>
						{t('errorUnknown', { ns: 'app' })}
						<ButtonSecondary
							text={t('tryAgain', { ns: 'app' })}
							disabled={isFetching}
							onClick={() => {
								void refetch()
							}}
						/>
					</ListStatusHeader>
				) : isPending ? (
					<ListStatusHeader style={{ marginTop: '0.5rem' }}>
						{t('fetchingMemberList')}...
					</ListStatusHeader>
				) : (
					<MotionContainer>
						{data?.members.map((member) => (
							<Member
								key={`pool_member_${member.address}`}
								member={member}
								bondedPool={bondedPool}
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

export const MembersList = (props: MembersListProps) => {
	const { network } = useNetwork()
	return (
		<ListProvider>
			<MembersListInner
				key={`${network}-${props.bondedPool.id}-${props.itemsPerPage}`}
				{...props}
			/>
		</ListProvider>
	)
}
