// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronDown,
	faRightFromBracket,
	faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloudSVG from 'assets/icons/cloud.svg?react'
import { useTheme } from 'hooks/useTheme'
import { useUi } from 'hooks/useUi'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { PageCategory } from 'types'
import { Page, Separator, Tooltip } from 'ui-core/base'
import { Popover } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import { getCategoryId } from 'utils'
import { CategoriesPopover } from './Categories'
import { NavSimple } from './NavSimple'
import type { DefaultMenuProps } from './types'
import {
	BarButton,
	BarFooterWrapper,
	BarIconsWrapper,
	BarLogoWrapper,
	CategoryHeader,
	Wrapper,
} from './Wrapper'

export const DefaultMenu = ({
	barItems,
	getActivePageForCategory,
	localCategory,
	pageCategories,
	pagesConfig,
	renderMain,
	title,
}: DefaultMenuProps) => {
	const { t } = useTranslation('app')
	const { advancedMode, setAdvancedMode, sideMenuMinimised } = useUi()
	const navigate = useNavigate()
	const { themeElementRef } = useTheme()
	const { status: modalStatus } = useOverlay().modal
	const { status: canvasStatus } = useOverlay().canvas

	const [openCategories, setOpenCategories] = useState<boolean>(false)

	const transparent = modalStatus === 'open' || canvasStatus === 'open'

	// Navigate to the last active page for a category
	const navigateToCategory = (category: PageCategory['key']) => {
		navigate(getActivePageForCategory(category))
	}

	return (
		<Page.Side.Default
			open={false}
			minimised={sideMenuMinimised}
			transparent={transparent}
			bar={
				!advancedMode ? undefined : (
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
											<FontAwesomeIcon
												icon={faIcon}
												transform={iconTransform}
											/>
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
			nav={
				!advancedMode ? (
					<NavSimple renderMain={renderMain} title={title} />
				) : (
					<Wrapper $minimised={sideMenuMinimised} $advancedMode={advancedMode}>
						<section>
							<Popover
								open={openCategories}
								portalContainer={themeElementRef.current || undefined}
								content={
									<CategoriesPopover
										getActivePageForCategory={getActivePageForCategory}
										pageCategories={pageCategories}
										pagesConfig={pagesConfig}
										setOpen={setOpenCategories}
									/>
								}
								onTriggerClick={() => {
									setOpenCategories(!openCategories)
								}}
								width="145px"
								align="start"
								arrow={false}
								sideOffset={0}
								transparent
							>
								<CategoryHeader className="menu-categories">
									<span>{t(localCategory, { ns: 'app' })}</span>
									<span>
										<FontAwesomeIcon
											icon={openCategories ? faTimes : faChevronDown}
											transform={openCategories ? 'shrink-2' : 'shrink-4'}
										/>
									</span>
								</CategoryHeader>
							</Popover>
							{renderMain({
								activeCategory: getCategoryId(pageCategories, localCategory),
								hidden: openCategories,
							})}
						</section>
						<section></section>
					</Wrapper>
				)
			}
		></Page.Side.Default>
	)
}
