// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCoins,
	faPeopleLine,
	faServer,
} from '@fortawesome/free-solid-svg-icons'
import { PageCategories, PagesConfig } from 'config'
import { setActivePage, useActivePageForCategory } from 'hooks/useActivePages'
import { usePageFromHash } from 'hooks/usePageFromHash'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
	DefaultMenu,
	type DefaultMenuBarItem,
	FloatingMenu,
	type SideMenuMainRenderProps,
} from 'ui-app/SideMenu'
import { Main } from './Main'

const DefaultMenuBarItems: DefaultMenuBarItem[] = [
	{ key: 'stake', faIcon: faCoins },
	{ key: 'validators', faIcon: faServer },
	{ key: 'pools', faIcon: faPeopleLine, iconTransform: 'grow-3' },
]

export const SideMenu = ({
	enableAdvancedMenu,
}: {
	enableAdvancedMenu: boolean
}) => {
	const { pathname } = useLocation()
	const { getActivePageForCategory } = useActivePageForCategory()
	const { categoryKey } = usePageFromHash({
		pageCategories: PageCategories,
		pagesConfig: PagesConfig,
	})

	// Track page visits and update local storage with active page per category
	useEffect(() => {
		const pageHash = `/${pathname.replace(/^\/+/, '').split('?')[0]}`
		if (categoryKey && pageHash) {
			setActivePage(categoryKey, pageHash)
		}
	}, [pathname, categoryKey])

	const renderMain = ({
		activeCategory,
		hidden,
		showHeaders,
	}: SideMenuMainRenderProps) => (
		<Main
			activeCategory={activeCategory}
			hidden={hidden}
			showHeaders={showHeaders}
		/>
	)

	return (
		<>
			<DefaultMenu
				barItems={DefaultMenuBarItems}
				getActivePageForCategory={getActivePageForCategory}
				localCategory={categoryKey}
				pageCategories={PageCategories}
				pagesConfig={PagesConfig}
				renderMain={renderMain}
				title="Cloud"
				enableAdvancedMenu={enableAdvancedMenu}
			/>
			<FloatingMenu renderMain={renderMain} title="Stake" />
		</>
	)
}
