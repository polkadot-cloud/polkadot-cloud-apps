// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { StablecoinsDappName } from 'consts'
import { SideMenu } from 'library/SideMenu'
import { Wallet } from 'library/Wallet'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { PageItem } from 'types'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { Headers } from 'ui-app/Headers'
import { MainFooter } from 'ui-app/MainFooter'
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
		<Page.Body id="portal-root">
			<Overlays />
			<SideMenu />
			<Page.Main>
				<HelmetProvider>
					<Headers Wallet={Wallet} />
					<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
						<Routes>
							<Route index element={<Navigate to="/send" replace />} />
							<Route
								path="/send"
								element={
									<PageWithTitle
										page={SendPage}
										appTitle={StablecoinsDappName}
									/>
								}
							/>
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
