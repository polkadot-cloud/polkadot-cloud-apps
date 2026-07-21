// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
			{/* <SideMenu /> */}
			<Page.Main>
				<HelmetProvider>
					<Headers />
					<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
						{/* Coming Soon */}
					</ErrorBoundary>
					<MainFooter />
				</HelmetProvider>
			</Page.Main>
		</Page.Body>
		<Offline />
	</ErrorBoundary>
)
