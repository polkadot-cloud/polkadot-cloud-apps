// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PageCategories, PagesConfig } from 'config'
import { useLocation } from 'react-router-dom'
import { getCategoryFromPage } from 'utils'

export const usePageFromHash = () => {
	const { pathname } = useLocation()
	const page = (pathname ?? '').replace(/^#?\/+/, '').split('?')[0]

	const categoryKey = getCategoryFromPage(PageCategories, PagesConfig, page)

	return { page, categoryKey }
}
