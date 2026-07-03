// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { validatorListSupported } from '@w3ux/validator-assets'
import type {
	NetworkId,
	PageCategory,
	PageCategoryItems,
	PagesConfigItems,
} from 'types'

// Get pages config, and remove operators page if it is not supported
export const getPagesConfig = (
	pagesConfig: PagesConfigItems,
	network: NetworkId,
	category: number | null,
	advancedMode: boolean,
	stakingState?: {
		inPool: boolean
		isBonding: boolean
	},
) => {
	const operatorsSupported = validatorListSupported(network)

	// Filter out operators page if not supported on network
	let filteredPagesConfig = !operatorsSupported
		? pagesConfig.filter((page) => page.key !== 'operators')
		: pagesConfig

	// Filter by category if specified
	if (category) {
		filteredPagesConfig = filteredPagesConfig.filter(
			(page) => page.category === category,
		)
	}

	// Filter out advanced pages if not in advanced mode
	if (!advancedMode) {
		filteredPagesConfig = filteredPagesConfig.filter(
			({ advanced }) => !advanced,
		)
	}

	// In Simple mode, handle active staking pages
	if (!advancedMode) {
		const { inPool = false, isBonding = false } = stakingState || {}

		// If user is both in a pool AND bonding, show both pages. Otherwise, show the unified page and
		// hide separate pages
		if (inPool && isBonding) {
			filteredPagesConfig = filteredPagesConfig.filter(
				(page) => page.key !== 'stake',
			)
		} else {
			filteredPagesConfig = filteredPagesConfig.filter(
				(page) => page.key !== 'pool' && page.key !== 'nominate',
			)
		}
	} else {
		// In Advanced mode, always hide the unified page and show separate pages
		filteredPagesConfig = filteredPagesConfig.filter(
			(page) => page.key !== 'stake',
		)
	}

	return filteredPagesConfig
}

// Get category id from category key
export const getCategoryId = (
	pageCategories: PageCategoryItems,
	key: string | null,
) => {
	return pageCategories.find((page) => page.key === key)?.id || null
}

// Check whether a given page key exists in the category
export const pageKeyExistsInCategory = (
	pagesConfig: PagesConfigItems,
	pathname: string | null,
	category: number,
) => {
	if (!pathname || category === null) return false

	return pagesConfig
		.filter((page) => page.category === category)
		.some((page) => page.hash === pathname)
}

// Get the category for a given page
export const getCategoryFromPage = (
	pageCategories: PageCategoryItems,
	pagesConfig: PagesConfigItems,
	pathname: string | null,
) => {
	const firstPageCategory = getFirstPageCategory(pageCategories)

	if (!pathname) return firstPageCategory.key

	const categoryId =
		pagesConfig.find((page) => page.key === pathname)?.category ||
		firstPageCategory.id

	return (
		pageCategories.find((category) => category.id === categoryId)?.key ||
		firstPageCategory.key
	)
}

// Gets the first page category
export const getFirstPageCategory = (
	pageCategories: PageCategoryItems,
): PageCategory => {
	return pageCategories[0]
}
