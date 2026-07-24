// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import { useTheme } from 'hooks/useTheme'
import { useUi } from 'hooks/useUi'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { PageCategory } from 'types'
import { Separator, Tooltip } from 'ui-core/base'
import type { BaseMenuProps } from './types'
import {
	BarButton,
	BarFooterWrapper,
	BarIconsWrapper,
	BarLogoWrapper,
} from './Wrapper'

export const AdvancedMenu = ({
	barItems,
	getActivePageForCategory,
	localCategory,
}: BaseMenuProps) => {
	const { t } = useTranslation('app')
	const { setAdvancedMode } = useUi()
	const navigate = useNavigate()
	const { themeElementRef } = useTheme()

	// Navigate to the last active page for a category
	const navigateToCategory = (category: PageCategory['key']) => {
		navigate(getActivePageForCategory(category))
	}

	return (
		<>
			<BarLogoWrapper>
				<CloudSVG />
			</BarLogoWrapper>
			<BarIconsWrapper>
				{barItems.map(({ faIcon, iconTransform, key }, index) => (
					<section key={key}>
						<Tooltip
							text={t(key)}
							side="right"
							container={themeElementRef.current || undefined}
							delayDuration={index === 0 ? 100 : 0}
							fadeIn
						>
							<BarButton
								type="button"
								onClick={() => {
									navigateToCategory(key)
								}}
								className={localCategory === key ? 'active' : ''}
							>
								<FontAwesomeIcon icon={faIcon} transform={iconTransform} />
							</BarButton>
						</Tooltip>
					</section>
				))}
			</BarIconsWrapper>
			<BarFooterWrapper>
				<Separator style={{ opacity: 0.25 }} />
				<Tooltip
					text={t('exitAdvancedMode')}
					side="right"
					container={themeElementRef.current || undefined}
					delayDuration={0}
					fadeIn
				>
					<BarButton
						type="button"
						onClick={() => {
							setAdvancedMode(false)
						}}
					>
						<FontAwesomeIcon icon={faRightFromBracket} />
					</BarButton>
				</Tooltip>
			</BarFooterWrapper>
		</>
	)
}
