// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ListProvider } from 'contexts/List'
import { useNetwork } from 'hooks/useNetwork'
import { usePoolMembers } from 'hooks/usePoolMembers'
import { List, ListStatusHeader, Wrapper as ListWrapper } from 'library/List'
import { MotionContainer } from 'library/List/MotionContainer'
import { Pagination } from 'library/List/Pagination'
import { fetchPoolMembers } from 'plugin-staking-api'
import { useEffect, useRef, useState } from 'react'
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
	const {
		meta,
		fetchPoolMemberData,
		fetchedPoolMembersApi,
		setFetchedPoolMembersApi,
	} = usePoolMembers()
	const { network } = useNetwork()

	const poolId = bondedPool.id

	// current page
	const [page, setPage] = useState<number>(1)

	// pagination
	const totalPages = Math.ceil(Number(memberCount) / itemsPerPage)
	const pageEnd = itemsPerPage - 1
	const pageStart = pageEnd - (itemsPerPage - 1)

	// handle validator list bootstrapping
	const fetchingMemberList = useRef<boolean>(false)

	const syncMemberList = async () => {
		try {
			if (poolId > 0 && !fetchingMemberList.current) {
				fetchingMemberList.current = true
				// Calculate offset based on page number (1-indexed)
				const offset = (page - 1) * itemsPerPage
				const { poolMembers } = await fetchPoolMembers(
					network,
					poolId,
					itemsPerPage,
					offset,
				)
				fetchingMemberList.current = false
				if (poolMembers.members.length > 0) {
					fetchPoolMemberData(poolMembers.members.map(({ address }) => address))
				}
				setFetchedPoolMembersApi('synced')
			}
		} catch {
			fetchingMemberList.current = false
			setFetchedPoolMembersApi('unsynced')
		}
	}

	// Merge member data with claim permissions to have all member data in one object
	const members = meta.poolMembers
		.map((member, index) => {
			if (!member) {
				return undefined
			}
			return {
				...member,
				claimPermission: meta.claimPermissions[index],
			}
		})
		.filter((m) => m !== undefined)

	// Get paginated subset of members
	const listMembers = members.slice(pageStart).slice(0, itemsPerPage)

	// Configure list when network is ready to fetch
	useEffect(() => {
		setFetchedPoolMembersApi('unsynced')
		syncMemberList()
	}, [poolId, page])

	return (
		<ListWrapper>
			<List $flexBasisLarge={'33.33%'}>
				{pagination && (
					<Pagination
						page={page}
						total={totalPages}
						setter={setPage}
						disabled={fetchedPoolMembersApi !== 'synced'}
					/>
				)}
				{fetchedPoolMembersApi !== 'synced' ? (
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
