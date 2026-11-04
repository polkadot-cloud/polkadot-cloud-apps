// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from 'ui-core/base'
import { SendForm } from 'ui-core/input'
import classes from './index.module.scss'

export const QuoteLoading = ({ children }: { children: ReactNode }) => (
	<span className={classes.loading} role="status">
		<span aria-hidden>
			<Spinner style={{ width: '1rem' }} />
		</span>
		<span>{children}</span>
	</span>
)

export const QuoteRoute = ({
	children,
	loading = false,
	loadingText,
	description,
}: {
	children?: ReactNode
	loading?: boolean
	loadingText?: string
	description?: string
}) => {
	const { t } = useTranslation('swap')
	return (
		<SendForm.Note
			label={t('route')}
			variant="muted"
			role="group"
			aria-label={t('route')}
			aria-description={description}
		>
			<div className={classes.routeValue} aria-live="polite">
				{loading ? (
					<QuoteLoading>{loadingText ?? t('fetchingQuote')}</QuoteLoading>
				) : (
					(children ?? '—')
				)}
			</div>
		</SendForm.Note>
	)
}

export const QuoteNotes = ({ children }: { children: ReactNode }) => (
	<SendForm.Notes className={classes.notes}>{children}</SendForm.Notes>
)
