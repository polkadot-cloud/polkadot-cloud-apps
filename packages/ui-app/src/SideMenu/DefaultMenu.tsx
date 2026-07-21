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

export const DefaultMenu = (props: DefaultMenuProps) => {
	const { renderMain, title } = props
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const { advancedMode, sideMenuMinimised } = useUi()
	const { status: modalStatus } = useOverlay().modal
	const { status: canvasStatus } = useOverlay().canvas

	const [openCategories, setOpenCategories] = useState<boolean>(false)

	const transparent = modalStatus === 'open' || canvasStatus === 'open'

	const advancedMenu = props.enableAdvancedMenu ? props : undefined
	const showAdvancedMenu = advancedMenu !== undefined && advancedMode

	return (
		<Page.Side.Default
			open={false}
			minimised={sideMenuMinimised}
			transparent={transparent}
			bar={
				!showAdvancedMenu || !advancedMenu ? undefined : (
					<AdvancedMenu
						barItems={advancedMenu.barItems}
						getActivePageForCategory={advancedMenu.getActivePageForCategory}
						localCategory={advancedMenu.localCategory}
					/>
				)
			}
			nav={
				!showAdvancedMenu || !advancedMenu ? (
					<NavSimple renderMain={renderMain} title={title} />
				) : (
					<Wrapper
						$minimised={sideMenuMinimised}
						$advancedMode={showAdvancedMenu}
					>
						<section>
							<Popover
								open={openCategories}
								portalContainer={themeElementRef.current || undefined}
								content={
									<CategoriesPopover
										getActivePageForCategory={
											advancedMenu.getActivePageForCategory
										}
										pageCategories={advancedMenu.pageCategories}
										pagesConfig={advancedMenu.pagesConfig}
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
									<span>{t(advancedMenu.localCategory, { ns: 'app' })}</span>
									<span>
										<FontAwesomeIcon
											icon={openCategories ? faTimes : faChevronDown}
											transform={openCategories ? 'shrink-2' : 'shrink-4'}
										/>
									</span>
								</CategoryHeader>
							</Popover>
							{renderMain({
								activeCategory: getCategoryId(
									advancedMenu.pageCategories,
									advancedMenu.localCategory,
								),
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
