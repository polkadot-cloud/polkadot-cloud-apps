// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActivePool } from 'hooks/useActivePool'
import { useApi } from 'hooks/useApi'
import { Warning } from 'library/Form/Warning'
import type { ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonOption } from 'ui-buttons'
import { useOverlay } from 'ui-overlay'
import type { TasksProps } from './types'
import { ContentWrapper, TaskInnerWrapper } from './Wrappers'

export const Tasks = forwardRef(
	({ setSection, setTask }: TasksProps, ref: ForwardedRef<HTMLDivElement>) => {
		const { t } = useTranslation('modals')
		const { closeModal } = useOverlay().modal
		const { openCanvas } = useOverlay().canvas
		const { globalMaxCommission } = useApi().poolsConfig
		const { activePool, isOwner, isBouncer } = useActivePool()

		const poolLocked = activePool?.bondedPool?.state === 'Blocked'
		const poolDestroying = activePool?.bondedPool?.state === 'Destroying'

		return (
			<ContentWrapper>
				<div ref={ref}>
					<div
						className="items"
						style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}
					>
						{poolDestroying && (
							<div style={{ marginBottom: '0.75rem' }}>
								<Warning text={t('beingDestroyed')} />
							</div>
						)}
						<ButtonOption
							onClick={() => {
								closeModal()
								openCanvas({
									key: 'Pool',
									options: {
										providedPool: {
											id: activePool?.id,
										},
									},
									size: 'xl',
								})
							}}
						>
							<TaskInnerWrapper>
								<h3>{t('viewPoolTitle')}</h3>
								<p>{t('viewPoolSubtitle')}</p>
							</TaskInnerWrapper>
						</ButtonOption>

						{isOwner() && globalMaxCommission > 0 && (
							<>
								<ButtonOption
									onClick={() => {
										setSection(1)
										setTask('claim_commission')
									}}
								>
									<TaskInnerWrapper>
										<h3>{t('claimCommission')}</h3>
										<p>{t('claimOutstandingCommission')}</p>
									</TaskInnerWrapper>
								</ButtonOption>
								<ButtonOption
									onClick={() => {
										setSection(1)
										setTask('manage_commission')
									}}
								>
									<TaskInnerWrapper>
										<h3>{t('manageCommission.title')}</h3>
										<p>{t('updatePoolCommission')}</p>
									</TaskInnerWrapper>
								</ButtonOption>
							</>
						)}
						<ButtonOption
							onClick={() => {
								setSection(1)
								setTask('set_claim_permission')
							}}
						>
							<TaskInnerWrapper>
								<h3>{t('updateClaimPermission')}</h3>
								<p>{t('updateWhoClaimRewards')}</p>
							</TaskInnerWrapper>
						</ButtonOption>

						{isOwner() && (
							<ButtonOption
								disabled={poolDestroying}
								onClick={() => {
									setSection(1)
									setTask('set_pool_metadata')
								}}
							>
								<TaskInnerWrapper>
									<h3>{t('renamePool')}</h3>
									<p>{t('updateName')}</p>
								</TaskInnerWrapper>
							</ButtonOption>
						)}
						{(isOwner() || isBouncer()) && (
							<>
								{poolLocked ? (
									<ButtonOption
										disabled={poolDestroying}
										onClick={() => {
											setSection(1)
											setTask('unlock_pool')
										}}
									>
										<TaskInnerWrapper>
											<h3>{t('unlockPool')}</h3>
											<p>{t('allowToJoin')}</p>
										</TaskInnerWrapper>
									</ButtonOption>
								) : (
									<ButtonOption
										disabled={poolDestroying}
										onClick={() => {
											setSection(1)
											setTask('lock_pool')
										}}
									>
										<TaskInnerWrapper>
											<h3>{t('lockPool')}</h3>
											<p>{t('stopJoiningPool')}</p>
										</TaskInnerWrapper>
									</ButtonOption>
								)}
								<ButtonOption
									disabled={poolDestroying}
									onClick={() => {
										setSection(1)
										setTask('destroy_pool')
									}}
								>
									<TaskInnerWrapper>
										<h3>{t('destroyPool')}</h3>
										<p>{t('changeToDestroy')}</p>
									</TaskInnerWrapper>
								</ButtonOption>
							</>
						)}
					</div>
				</div>
			</ContentWrapper>
		)
	},
)

Tasks.displayName = 'Tasks'
