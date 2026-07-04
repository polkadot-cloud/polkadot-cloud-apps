// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Headers } from 'library/Headers'
import { SideMenu } from 'library/SideMenu'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainFooter } from 'ui-app/MainFooter'
import { Page } from 'ui-core/base'
import { Overlays } from './Overlays'
import { Send } from './pages/Send'

export const Router = () => (
	<Page.Body id="portal-root">
		<Overlays />
		<SideMenu />
		<Page.Main>
			<Headers />
			<Routes>
				<Route index element={<Navigate to="/send" replace />} />
				<Route
					path="/send"
					element={
						<Page.Container>
							<Send />
						</Page.Container>
					}
				/>
				<Route path="*" element={<Navigate to="/send" replace />} />
			</Routes>
			<MainFooter />
		</Page.Main>
	</Page.Body>
)
