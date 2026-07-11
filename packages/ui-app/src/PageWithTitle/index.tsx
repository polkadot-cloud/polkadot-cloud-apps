// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import type { PageItem } from 'types'
import { Page } from 'ui-core/base'

type PageWithTitleProps = {
	appTitle?: string
	page: PageItem
}

export const PageWithTitle = (props: PageWithTitleProps) => {
	const { t } = useTranslation()
	const { Entry, key } = props.page
	const appTitle = props.appTitle ?? t('title', { ns: 'app' })

	return (
		<Page.Container>
			<Helmet>
				<title>{`${t(key, { ns: 'app' })} | ${appTitle}`}</title>
			</Helmet>
			<Entry page={props.page} />
		</Page.Container>
	)
}
