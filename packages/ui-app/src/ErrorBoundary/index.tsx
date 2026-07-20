// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ErrorBoundaryFallback } from 'ui-core/base'

interface ErrorFallbackProps {
	error?: unknown
	resetErrorBoundary?: () => void
}

// Failed chunk or stylesheet fetches cannot be recovered by re-rendering, as rejected dynamic
// imports are memoised. A full page reload is required to fetch fresh assets
const isAssetLoadError = (error: unknown): boolean =>
	error instanceof Error &&
	/preload CSS|dynamically imported module|module script/i.test(error.message)

const getResetHandler = (
	error: unknown,
	resetErrorBoundary?: () => void,
): (() => void) | undefined =>
	isAssetLoadError(error) ? () => window.location.reload() : resetErrorBoundary

const useErrorFallbackLabels = () => {
	const { t } = useTranslation('app')

	return {
		action: t('clickToReload'),
		title: t('errorUnknown'),
	}
}

export const ErrorFallbackApp = ({
	error,
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={getResetHandler(error, resetErrorBoundary)}
			title={title}
			variant="app"
		/>
	)
}

export const ErrorFallbackRoutes = ({
	error,
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={getResetHandler(error, resetErrorBoundary)}
			title={title}
			variant="routes"
		/>
	)
}

export const ErrorFallbackModal = ({
	error,
	resetErrorBoundary,
}: ErrorFallbackProps) => {
	const { action, title } = useErrorFallbackLabels()

	return (
		<ErrorBoundaryFallback
			action={action}
			onReset={getResetHandler(error, resetErrorBoundary)}
			title={title}
			variant="modal"
		/>
	)
}
