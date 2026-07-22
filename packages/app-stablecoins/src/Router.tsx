// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SideMenu } from 'library/SideMenu'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { Headers } from 'ui-app/Headers'
import { MainFooter } from 'ui-app/MainFooter'
import { Offline } from 'ui-app/Offline'
import { Page } from 'ui-core/base'
import { Overlays } from './Overlays'

export const Router = () => (
	<ErrorBoundary FallbackComponent={ErrorFallbackApp}>
		<Page.Body id="portal-root">
			<Overlays />
			<SideMenu enableAdvancedMenu={false} />
			<Page.Main>
				<HelmetProvider>
					<Headers />
					<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
						<Page.Container></Page.Container>
						{/* Coming Soon */}
					</ErrorBoundary>
					<MainFooter />
				</HelmetProvider>
			</Page.Main>
		</Page.Body>
		<Offline />
	</ErrorBoundary>
)
