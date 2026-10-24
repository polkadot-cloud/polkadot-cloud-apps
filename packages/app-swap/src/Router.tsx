// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SwapDappName } from 'consts'
import { Wallet } from 'library/Balances'
import { SideMenu } from 'library/SideMenu'
import { Sync } from 'library/Sync'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { Headers } from 'ui-app/Headers'
import { MainFooter } from 'ui-app/MainFooter'
import { NotificationPrompts } from 'ui-app/NotificationPrompts'
import { Offline } from 'ui-app/Offline'
import { PageWithTitle } from 'ui-app/PageWithTitle'
import { Page } from 'ui-core/base'
import { Overlays } from './Overlays'
import { pages } from './pages'

export const Router = () => (
	<ErrorBoundary FallbackComponent={ErrorFallbackApp}>
		<NotificationPrompts />
		<Page.Body id="portal-root">
			<Overlays />
			<SideMenu enableAdvancedMenu={false} />
			<Page.Main>
				<HelmetProvider>
					<Headers
						showAccount={false}
						NodesLeft={{
							sync: Sync,
						}}
						NodesRight={{ wallet: Wallet }}
						menuPopoverFeatures={{
							network: false,
							advancedMode: false,
							helpPrompts: false,
							share: false,
							plugins: false,
							syncAccounts: false,
							sendModal: false,
						}}
					/>
					<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
						<Routes>
							<Route index element={<Navigate to="/swap" replace />} />
							{pages.map((page) => (
								<Route
									key={page.key}
									path={`/${page.key}`}
									element={
										<PageWithTitle page={page} appTitle={SwapDappName} />
									}
								/>
							))}
							<Route path="*" element={<Navigate to="/swap" replace />} />
						</Routes>
					</ErrorBoundary>
					<MainFooter showDocs={false} />
				</HelmetProvider>
			</Page.Main>
		</Page.Body>
		<Offline />
	</ErrorBoundary>
)
