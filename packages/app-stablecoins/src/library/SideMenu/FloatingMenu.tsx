// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOnResize, useOutsideAlerter } from '@w3ux/hooks'
import CloudSVG from 'assets/icons/cloud.svg?react'
import { PageWidthMediumThreshold } from 'consts'
import { useUi } from 'hooks/useUI'
import { useRef } from 'react'
import { Page } from 'ui-core/base'
import { Main } from './Main'
import { LogoWrapper, Wrapper } from './Wrapper'

export const FloatingMenu = () => {
	const { setSideMenu, sideMenuOpen } = useUi()

	useOnResize(() => {
		if (window.innerWidth >= PageWidthMediumThreshold) {
			setSideMenu(false)
		}
	})

	const ref = useRef<HTMLDivElement | null>(null)
	useOutsideAlerter(ref, () => {
		setSideMenu(false)
	})

	return (
		<Page.Side.Floating open={sideMenuOpen} minimised={false}>
			<Wrapper ref={ref} $minimised={false}>
				<section>
					<LogoWrapper $minimised={false}>
						<CloudSVG />
						<h3>Cloud</h3>
					</LogoWrapper>
					<Main />
				</section>
				<section></section>
			</Wrapper>
		</Page.Side.Floating>
	)
}
