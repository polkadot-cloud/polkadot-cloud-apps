// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault } from '@w3ux/utils'
import { PageCategories, PagesConfig } from 'config'
import { ActivePagesKey } from 'consts'
import { useActivePool } from 'hooks/useActivePool'
import { useNetwork } from 'hooks/useNetwork'
import { useStaking } from 'hooks/useStaking'
import { useUi } from 'hooks/useUi'
import type { NavSection } from 'types'
import { getPagesConfig } from 'utils'
import type { ActivePagesRecord } from './types'

// Default active pages (using default routes from PageCategories)
const getDefaultActivePages = (): ActivePagesRecord => {
	const defaults: ActivePagesRecord = {}
	for (const category of PageCategories) {
		defaults[category.key] = category.defaultRoute
	}
	return defaults
}

// Get active pages from local storage
export const getActivePages = (): ActivePagesRecord => {
	try {
		const stored = localStorageOrDefault(
			ActivePagesKey,
			getDefaultActivePages(),
			true,
		) as ActivePagesRecord
		return stored
	} catch {
		return getDefaultActivePages()
	}
}

// Set active page for a category in local storage
export const setActivePage = (category: NavSection, route: string): void => {
	// Validate that the route belongs to the category
	const pageConfig = PagesConfig.find((page) => page.hash === route)
	const categoryConfig = PageCategories.find((cat) => cat.key === category)

	if (
		pageConfig &&
		categoryConfig &&
		pageConfig.category === categoryConfig.id
	) {
		const activePages = getActivePages()
		activePages[category] = route
		localStorage.setItem(ActivePagesKey, JSON.stringify(activePages))
	}
}

// Get active page for a specific category
export const useActivePageForCategory = () => {
	const { network } = useNetwork()
	const { advancedMode } = useUi()
	const { inPool } = useActivePool()
	const { isBonding } = useStaking()

	const getActivePageForCategory = (category: NavSection): string => {
		const activePages = getActivePages()
		const storedPage = activePages[category]
		const categoryConfig = PageCategories.find((cat) => cat.key === category)

		if (categoryConfig) {
			const pagesConfig = getPagesConfig(
				PagesConfig,
				network,
				categoryConfig.id,
				advancedMode,
				{
					isBonding,
					inPool,
				},
			)
			// Fall back to category's default route if stored page doesn't exist
			if (!pagesConfig.find((page) => page.hash === storedPage)) {
				return categoryConfig.defaultRoute
			}
		}
		return storedPage || '/overview'
	}

	return { getActivePageForCategory }
}
