// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { useUi } from 'hooks/useUi'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { Popover } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import { getCategoryId } from 'utils'
import { AdvancedMenu } from './AdvancedMenu'
import { CategoriesPopover } from './Categories'
import { NavSimple } from './NavSimple'
import type { DefaultMenuProps } from './types'
import { CategoryHeader, Wrapper } from './Wrapper'

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
	const { themeElementRef } = useTheme()
	const { advancedMode, sideMenuMinimised } = useUi()
	const { status: modalStatus } = useOverlay().modal
	const { status: canvasStatus } = useOverlay().canvas

	const [openCategories, setOpenCategories] = useState<boolean>(false)

	const transparent = modalStatus === 'open' || canvasStatus === 'open'

	return (
		<Page.Side.Default
			open={false}
			minimised={sideMenuMinimised}
			transparent={transparent}
			bar={
				!advancedMode ? undefined : (
					<AdvancedMenu
						barItems={barItems}
						getActivePageForCategory={getActivePageForCategory}
						localCategory={localCategory}
					/>
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
