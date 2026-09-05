// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { SwapDappName } from 'consts'
import { Wallet } from 'library/Balances'
import { SideMenu } from 'library/SideMenu'
import { Sync } from 'library/Sync'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { PageItem } from 'types'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { Headers } from 'ui-app/Headers'
import { MainFooter } from 'ui-app/MainFooter'
import { NotificationPrompts } from 'ui-app/NotificationPrompts'
import { Offline } from 'ui-app/Offline'
import { PageWithTitle } from 'ui-app/PageWithTitle'
import { Page } from 'ui-core/base'
import { Overlays } from './Overlays'
import { Send } from './pages/Send'

const SendPage: PageItem = {
	category: 0,
	key: 'send',
	uri: `${import.meta.env.BASE_URL}send`,
	hash: '/send',
	Entry: Send,
	faIcon: faPaperPlane,
	advanced: false,
}

export const Router = () => (
	<ErrorBoundary FallbackComponent={ErrorFallbackApp}>
		<NotificationPrompts />
		<Page.Body id="portal-root">
			<Overlays />
			<SideMenu enableAdvancedMenu={false} />
			<Page.Main>
				<HelmetProvider>
					<Headers
						NodesLeft={{ sync: Sync }}
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
							<Route index element={<Navigate to="/send" replace />} />
							<Route
								path="/send"
								element={
									<PageWithTitle page={SendPage} appTitle={SwapDappName} />
								}
							/>
							<Route path="*" element={<Navigate to="/send" replace />} />
						</Routes>
					</ErrorBoundary>
					<MainFooter showDocs={false} />
				</HelmetProvider>
			</Page.Main>
		</Page.Body>
		<Offline />
	</ErrorBoundary>
)
