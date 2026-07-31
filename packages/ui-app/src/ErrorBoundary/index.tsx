// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import {
	ErrorBoundaryFallback,
	type ErrorBoundaryFallbackVariant,
} from 'ui-core/base'

interface ErrorFallbackProps {
	resetErrorBoundary?: () => void
}

const ErrorFallback = ({
	resetErrorBoundary,
	variant,
}: ErrorFallbackProps & { variant: ErrorBoundaryFallbackVariant }) => {
	const { t } = useTranslation('app')

	return (
		<ErrorBoundaryFallback
			action={t('tryAgain', { ns: 'modals' })}
			onReset={resetErrorBoundary}
			title={t('errorUnknown')}
			variant={variant}
		/>
	)
}

export const ErrorFallbackApp = (props: ErrorFallbackProps) => (
	<ErrorFallback {...props} variant="app" />
)

export const ErrorFallbackRoutes = (props: ErrorFallbackProps) => (
	<ErrorFallback {...props} variant="routes" />
)

export const ErrorFallbackModal = (props: ErrorFallbackProps) => (
	<ErrorFallback {...props} variant="modal" />
)
