// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useLocation } from 'react-router-dom'
import type { PageCategoryItems, PagesConfigItems } from 'types'
import { getCategoryFromPage } from 'utils'

interface UsePageFromHashProps {
	pageCategories: PageCategoryItems
	pagesConfig: PagesConfigItems
}

export const usePageFromHash = ({
	pageCategories,
	pagesConfig,
}: UsePageFromHashProps) => {
	const { pathname } = useLocation()
	const page = (pathname ?? '').replace(/^#?\/+/, '').split('?')[0]

	const categoryKey = getCategoryFromPage(pageCategories, pagesConfig, page)

	return { page, categoryKey }
}
