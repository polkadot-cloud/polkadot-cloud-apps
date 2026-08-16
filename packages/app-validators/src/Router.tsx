// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { ValidatorsDappName } from 'consts'
import { useUi } from 'hooks/useUi'
import { useValidatorFromUrl } from 'hooks/useValidatorFromUrl'
import { HelpTooltip } from 'library/HelpTooltip'
import { Tooltip } from 'library/Tooltip'
import { ValidatorsStandalone } from 'pages/Validators/Standalone'
import { ApolloProvider, client } from 'plugin-staking-api'
import { useEffect, useRef } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import {
	HashRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import type { PageItem } from 'types'
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'ui-app/ErrorBoundary'
import { MainFooter } from 'ui-app/MainFooter'
import { Menu } from 'ui-app/Menu'
import { NotificationPrompts } from 'ui-app/NotificationPrompts'
import { Offline } from 'ui-app/Offline'
import { PageWithTitle } from 'ui-app/PageWithTitle'
import { Page } from 'ui-core/base'
import { Headers } from './Headers'
import { Overlays } from './Overlays'

const ValidatorsPage: PageItem = {
	category: 0,
	key: 'validators',
	uri: `${import.meta.env.BASE_URL}validators`,
	hash: '/validators',
	Entry: ValidatorsStandalone,
	faIcon: faMagnifyingGlass,
	advanced: false,
}

const RouterInner = () => {
	const { pathname } = useLocation()
	const { setContainerRefs } = useUi()
	const mainInterfaceRef = useRef<HTMLDivElement>(null)

	useValidatorFromUrl()

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])

	useEffect(() => {
		setContainerRefs({
			mainInterface: mainInterfaceRef,
		})
	}, [])

	return (
		<ErrorBoundary FallbackComponent={ErrorFallbackApp}>
			<ApolloProvider client={client}>
				<NotificationPrompts />
				<Page.Body id="portal-root">
					<HelpTooltip />
					<Overlays />
					<Menu />
					<Tooltip />
					<Page.Main ref={mainInterfaceRef}>
						<HelmetProvider>
							<Headers />
							<ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
								<Routes>
									<Route
										index
										element={<Navigate to="/validators" replace />}
									/>
									<Route
										path="/validators"
										element={
											<PageWithTitle
												page={ValidatorsPage}
												appTitle={ValidatorsDappName}
											/>
										}
									/>
									<Route
										path="*"
										element={<Navigate to="/validators" replace />}
									/>
								</Routes>
							</ErrorBoundary>
							<MainFooter />
						</HelmetProvider>
					</Page.Main>
				</Page.Body>
				<Offline />
			</ApolloProvider>
		</ErrorBoundary>
	)
}

export const Router = () => (
	<HashRouter basename="/">
		<RouterInner />
	</HashRouter>
)
