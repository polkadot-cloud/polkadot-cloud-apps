// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { i18next } from 'locales'
import { I18nextProvider } from 'react-i18next'
import { ThemeValuesProvider } from './contexts/ThemeValues'
import { Providers } from './Providers'

export const App = () => (
	<I18nextProvider i18n={i18next}>
		<ThemeValuesProvider>
			<Providers />
		</ThemeValuesProvider>
	</I18nextProvider>
)
