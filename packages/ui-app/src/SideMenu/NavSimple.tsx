// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import { useUi } from 'hooks/useUi'
import type { NavSimpleProps } from './types'
import { LogoWrapper, ToggleWrapper, Wrapper } from './Wrapper'

export const NavSimple = ({ renderMain, title }: NavSimpleProps) => {
	const { sideMenuMinimised, userSideMenuMinimised, setUserSideMenuMinimised } =
		useUi()

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
						{!sideMenuMinimised && <h3>{title}</h3>}
					</LogoWrapper>
					{renderMain({ activeCategory: null })}
				</section>
				<section></section>
			</Wrapper>
		</>
	)
}
