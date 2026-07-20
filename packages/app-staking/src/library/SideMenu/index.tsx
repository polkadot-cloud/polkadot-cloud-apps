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
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { NavSection } from 'types'
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

export const SideMenu = () => {
	const { pathname } = useLocation()
	const { getActivePageForCategory } = useActivePageForCategory()
	const { categoryKey } = usePageFromHash({
		pageCategories: PageCategories,
		pagesConfig: PagesConfig,
	})

	// Define local category state to manage active category between both menu versions. Speeds up
	// re-renders compared to url changes
	const [localCategory, setLocalCategory] = useState<NavSection>(categoryKey)

	// Update category key if changed externally
	useEffect(() => {
		if (categoryKey !== localCategory) {
			setLocalCategory(categoryKey)
		}
	}, [categoryKey])

	// Track page visits and update local storage with active page per category
	useEffect(() => {
		const pageHash = `/${pathname.replace(/^\/+/, '').split('?')[0]}`
		if (categoryKey && pageHash) {
			setActivePage(categoryKey, pageHash)
		}
	}, [pathname, categoryKey])

	const renderMain = ({
		activeCategory,
		advancedMode,
		hidden,
		showHeaders,
	}: SideMenuMainRenderProps) => (
		<Main
			activeCategory={activeCategory}
			hidden={hidden}
			showHeaders={showHeaders}
			setLocalCategory={advancedMode ? setLocalCategory : undefined}
		/>
	)

	return (
		<>
			<DefaultMenu
				barItems={DefaultMenuBarItems}
				getActivePageForCategory={getActivePageForCategory}
				localCategory={localCategory}
				pageCategories={PageCategories}
				pagesConfig={PagesConfig}
				renderMain={renderMain}
				title="Cloud"
			/>
			<FloatingMenu renderMain={renderMain} title="Stake" />
		</>
	)
}
