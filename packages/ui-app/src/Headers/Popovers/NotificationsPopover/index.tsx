// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { useOutsideAlerter } from '@w3ux/hooks'
import { useBalances } from 'hooks/useBalances'
import type { PoolInvite } from 'hooks/useInvites'
import { useInvites } from 'hooks/useInvites'
import { useStaking } from 'hooks/useStaking'
import { type Dispatch, type SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { Heading, List, Padding } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'

export const NotificationsPopover = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>
}) => {
	const { t } = useTranslation('app')
	const { isBonding } = useStaking()
	const { openCanvas } = useOverlay().canvas
	const { getPoolMembership } = useBalances()
	const { activeAddress } = useActiveAccount()
	const { inviteConfig, dismissInvite } = useInvites()

	const { membership } = getPoolMembership(activeAddress)
	const alreadyStaking = membership || isBonding

	// NOTE: We assume a valid pool invite is active
	const popoverRef = useRef<HTMLDivElement>(null)

	// Determine if a pool invite is active
	let poolId: number | undefined
	if (inviteConfig?.type === 'pool') {
		poolId = (inviteConfig.invite as PoolInvite).poolId
	}

	// Close the menu if clicked outside of its container
	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-notifications'])

	const notifications = []
	if (inviteConfig) {
		const actions = []
		if (alreadyStaking) {
			actions.push({
				text: t('alreadyStaking', { ns: 'app' }),
				onClick: () => {
					// Do nothing
				},
				disabled: true,
			})
		} else {
			actions.push({
				text: t('viewInvite'),
				onClick: () => {
					setOpen(false)
					openCanvas({
						key: 'Pool',
						options: {
							providedPool: {
								id: poolId,
							},
						},
						size: 'xl',
					})
				},
				disabled: false,
			})
		}

		notifications.push({
			title: `${t('invitePool')}!`,
			actions: [
				...actions,
				{
					text: t('dismiss'),
					onClick: () => {
						dismissInvite()
					},
					disabled: false,
				},
			],
		})
	}

	return (
		<div
			ref={popoverRef}
			style={{
				background: 'var(--btn-popover-tab-bg)',
				borderRadius: '0.75rem',
			}}
		>
			<Padding>
				<Heading border={notifications.length === 0}>
					{t('notification', { count: notifications.length })}
				</Heading>
				<List>
					{notifications.map((n) => (
						<div key={`notification_${n.title}`}>
							<h3>
								<FontAwesomeIcon icon={faPaperPlane} />
								{n.title}
							</h3>
							<PopoverTab.Container position="bottom">
								{n.actions.map((action) => (
									<PopoverTab.Button
										key={`${n.title}_${action.text}`}
										text={action.text}
										onClick={() => action.onClick()}
										disabled={action.disabled}
									/>
								))}
							</PopoverTab.Container>
						</div>
					))}
				</List>
			</Padding>
		</div>
	)
}
