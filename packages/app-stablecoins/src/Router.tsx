// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Headers } from 'library/Headers'
import { SideMenu } from 'library/SideMenu'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { MainFooter } from 'ui-app/MainFooter'
import { Offline } from 'ui-app/Offline'
import { PageWithTitle } from 'ui-app/PageWithTitle'
import { Page } from 'ui-core/base'
import { Overlays } from './Overlays'
import { Send } from './pages/Send'

const AppTitle = 'Polkadot Cloud Stablecoins'

const SendPage = () => {
	const { t } = useTranslation('app')

	return (
		<PageWithTitle title={t('send')} appTitle={AppTitle}>
			<Send />
		</PageWithTitle>
	)
}

export const Router = () => (
	<ErrorBoundary FallbackComponent={ErrorFallbackApp}>
		<Page.Body id="portal-root">
			<Overlays />
			<SideMenu />
			<Page.Main>
				<HelmetProvider>
					<Headers />
					<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
						<Routes>
							<Route index element={<Navigate to="/send" replace />} />
							<Route path="/send" element={<SendPage />} />
							<Route path="*" element={<Navigate to="/send" replace />} />
						</Routes>
					</ErrorBoundary>
					<MainFooter />
				</HelmetProvider>
			</Page.Main>
		</Page.Body>
		<Offline />
	</ErrorBoundary>
)
