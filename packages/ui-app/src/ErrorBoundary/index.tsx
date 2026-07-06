// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ErrorBoundaryFallback } from 'ui-core/base'

interface ErrorFallbackProps {
	resetErrorBoundary?: () => void
}

const useErrorFallbackLabels = () => {
	const { t } = useTranslation('app')

	return {
		action: t('clickToReload'),
		title: t('errorUnknown'),
	}
}

export const ErrorFallbackApp = ({
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={resetErrorBoundary}
			title={title}
			variant="app"
		/>
	)
}

export const ErrorFallbackRoutes = ({
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={resetErrorBoundary}
			title={title}
			variant="routes"
		/>
	)
}

export const ErrorFallbackModal = ({
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={resetErrorBoundary}
			title={title}
			variant="modal"
		/>
	)
}
