// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setActivePage } from 'hooks/useActivePages'
import { usePageFromHash } from 'hooks/usePageFromHash'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { NavSection } from 'types'
import { DefaultMenu } from './DefaultMenu'
import { FloatingtMenu } from './FloatingMenu'

export const SideMenu = () => {
	const { pathname } = useLocation()
	const { categoryKey } = usePageFromHash()

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

	return (
		<>
			<DefaultMenu localCategory={localCategory} />
			<FloatingtMenu setLocalCategory={setLocalCategory} />
		</>
	)
}
