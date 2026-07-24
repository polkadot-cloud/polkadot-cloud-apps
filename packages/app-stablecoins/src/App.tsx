// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setDefaultSideMenuMinimised } from 'hooks/useUi'
import { i18next } from 'locales'
import { I18nextProvider } from 'react-i18next'
import { Providers } from './Providers'

setDefaultSideMenuMinimised(true)

export const App = () => (
	<I18nextProvider i18n={i18next}>
		<Providers />
	</I18nextProvider>
)
