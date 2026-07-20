// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import type { UiHookInterface } from 'hooks/useUi'
import { useUi } from 'hooks/useUi'
import { LogoWrapper, ToggleWrapper, Wrapper } from 'ui-app/SideMenu'
import { Main } from './Main'

export const NavSimple = () => {
	const {
		sideMenuMinimised,
		userSideMenuMinimised,
		setUserSideMenuMinimised,
	}: UiHookInterface = useUi()

	return (
		<>
			<ToggleWrapper
				type="button"
				onClick={() => setUserSideMenuMinimised(!userSideMenuMinimised)}
			>
				<span className="label">
					<FontAwesomeIcon
						icon={sideMenuMinimised ? faChevronRight : faChevronLeft}
						transform="shrink-6"
					/>
				</span>
			</ToggleWrapper>
			<Wrapper $minimised={sideMenuMinimised}>
				<section>
					<LogoWrapper $minimised={sideMenuMinimised}>
						<CloudSVG />
						{!sideMenuMinimised && <h3>Cloud</h3>}
					</LogoWrapper>
					<Main activeCategory={null} />
				</section>
				<section></section>
			</Wrapper>
		</>
	)
}
