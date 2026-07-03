// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useThemeValues } from 'contexts/ThemeValues'
import { CardWrapper } from 'library/Card/Wrappers'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { MembersList as FetchPageMemberList } from './Lists/FetchPage'

export const Members = ({ bondedPool }: { bondedPool: BondedPool }) => {
	const { t } = useTranslation('pages')
	const { getThemeValue } = useThemeValues()
	const { activeAddress } = useActiveAccount()

	const annuncementBorderColor = getThemeValue('--status-warning')

	const isDepositor = bondedPool.roles.depositor === activeAddress
	const isRoot = bondedPool.roles.root === activeAddress
	const isOwner = bondedPool.roles.depositor === activeAddress
	const isBouncer = bondedPool.roles.bouncer === activeAddress

	const showBlockedPrompt =
		bondedPool.state === 'Blocked' && (isOwner || isBouncer)

	const memberCount = bondedPool.memberCounter || 0

	return (
		<>
			{/* Pool in Blocked state: allow root & bouncer to unbond & withdraw members */}
			{showBlockedPrompt && (
				<CardWrapper
					className="canvas"
					style={{
						border: `1px solid ${annuncementBorderColor}`,
						marginBottom: '1.5rem',
					}}
				>
					<div className="content">
						<h3>{t('poolCurrentlyLocked')}</h3>
						<h4>
							{t('permissionToUnbond')}({' '}
							<FontAwesomeIcon icon={faBars} transform="shrink-2" /> ){' '}
							{t('managementOptions')}
						</h4>
					</div>
				</CardWrapper>
			)}

			{/* Pool in Destroying state: allow anyone to unbond & withdraw members */}
			{bondedPool.state === 'Destroying' && (
				<CardWrapper
					className="canvas"
					style={{
						border: `1px solid ${annuncementBorderColor}`,
						marginBottom: '1.5rem',
					}}
				>
					<div className="content">
						<h3>{t('poolInDestroyingState')}</h3>
						<h4>
							{t('permissionToUnbond')} ({' '}
							<FontAwesomeIcon icon={faBars} transform="shrink-2" /> ){' '}
							{t('managementOptions')}
						</h4>
					</div>
				</CardWrapper>
			)}

			<CardWrapper className="transparent">
				<FetchPageMemberList
					pagination={true}
					bondedPool={bondedPool}
					memberCount={memberCount}
					itemsPerPage={50}
					isDepositor={isDepositor}
					isRoot={isRoot}
					isOwner={isOwner}
					isBouncer={isBouncer}
				/>
			</CardWrapper>
		</>
	)
}
