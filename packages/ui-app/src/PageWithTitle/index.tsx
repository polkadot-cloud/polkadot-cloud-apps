// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import type { PageItem } from 'types'
import { Page } from 'ui-core/base'

type PageWithTitleProps =
	| {
			appTitle?: string
			page: PageItem
			children?: never
			title?: never
	  }
	| {
			appTitle: string
			children: ReactNode
			page?: never
			title: string
	  }

export const PageWithTitle = (props: PageWithTitleProps) => {
	const { t } = useTranslation()
	const appTitle = props.appTitle ?? t('title', { ns: 'app' })
	const pageTitle = props.page ? t(props.page.key, { ns: 'app' }) : props.title

	const content = props.page ? (
		<props.page.Entry page={props.page} />
	) : (
		props.children
	)

	return (
		<Page.Container>
			<Helmet>
				<title>{`${pageTitle} | ${appTitle}`}</title>
			</Helmet>
			{content}
		</Page.Container>
	)
}
