// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faBars,
	faCopy,
	faShare,
	faUnlockAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useApi } from 'hooks/useApi'
import { useMenu } from 'hooks/useMenu'
import { ClaimPermission } from 'library/ListItem/Labels/ClaimPermission'
import { Identity } from 'library/ListItem/Labels/Identity'
import { PoolMemberBonded } from 'library/ListItem/Labels/PoolMemberBonded'
import { Wrapper } from 'library/ListItem/Wrappers'
import { MenuList } from 'library/Menu/List'
import { motion } from 'motion/react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyJson } from 'types'
import { HeaderButtonRow, LabelRow, Separator } from 'ui-core/list'
import { usePrompt } from 'ui-overlay'
import { UnbondMember } from '../Prompts/UnbondMember'
import { WithdrawMember } from '../Prompts/WithdrawMember'
import type { MemberProps } from './types'

export const Member = ({
	member,
	bondedPool,
	isDepositor,
	isRoot,
	isOwner,
	isBouncer,
}: MemberProps) => {
	const { t } = useTranslation()
	const { activeEra } = useApi()
	const { openMenu, open } = useMenu()
	const { openPromptWith } = usePrompt()

	// Ref for the member container.
	const memberRef = useRef<HTMLDivElement | null>(null)

	const state = bondedPool.state
	const canUnbondBlocked =
		state === 'Blocked' && (isOwner || isBouncer || isRoot)
	const canUnbondDestroying = state === 'Destroying' && !isDepositor

	const menuItems: AnyJson[] = []

	// Add copy address menu item.
	menuItems.push({
		icon: <FontAwesomeIcon icon={faCopy} transform="shrink-3" />,
		wrap: null,
		title: `${t('copyAddress', { ns: 'app' })}`,
		cb: () => {
			navigator.clipboard.writeText(member.address)
		},
	})

	if (canUnbondBlocked || canUnbondDestroying) {
		const { points, unbondingEras } = member

		if (points !== 0n) {
			menuItems.push({
				icon: <FontAwesomeIcon icon={faUnlockAlt} transform="shrink-3" />,
				wrap: null,
				title: `${t('unbondFunds', { ns: 'pages' })}`,
				cb: () => {
					openPromptWith(<UnbondMember who={member.address} member={member} />)
				},
			})
		}

		if (Object.values(unbondingEras).length) {
			let canWithdraw = false
			for (const [era] of unbondingEras) {
				if (activeEra.index > era) {
					canWithdraw = true
				}
			}

			if (canWithdraw) {
				menuItems.push({
					icon: <FontAwesomeIcon icon={faShare} transform="shrink-3" />,
					wrap: null,
					title: `${t('withdrawFunds', { ns: 'pages' })}`,
					cb: () => {
						openPromptWith(
							<WithdrawMember
								who={member.address}
								member={member}
								memberRef={memberRef}
							/>,
						)
					},
				})
			}
		}
	}

	// Handler for opening menu.
	const toggleMenu = (ev: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (!open) {
			openMenu(ev, <MenuList items={menuItems} />)
		}
	}

	return (
		<motion.div
			className={`item col`}
			ref={memberRef}
			variants={{
				hidden: {
					y: 15,
					opacity: 0,
				},
				show: {
					y: 0,
					opacity: 1,
				},
			}}
		>
			<Wrapper className="member">
				<div className="inner canvas">
					<div className="row top">
						<Identity address={member.address} />
						<div>
							<HeaderButtonRow>
								{menuItems.length > 0 && (
									<button
										type="button"
										className="label"
										disabled={!member}
										onClick={(ev) => toggleMenu(ev)}
									>
										<FontAwesomeIcon icon={faBars} transform="shrink-3" />
									</button>
								)}
							</HeaderButtonRow>
						</div>
					</div>
					<Separator />
					<div className="row bottom">
						<PoolMemberBonded member={member} />
						<LabelRow>
							<ClaimPermission claimPermission={member.claimPermission} />
						</LabelRow>
					</div>
				</div>
			</Wrapper>
		</motion.div>
	)
}
