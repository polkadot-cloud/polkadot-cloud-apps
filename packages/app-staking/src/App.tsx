// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Providers } from 'Providers'
import { ThemesProvider } from 'contexts/Themes'
import { ThemeValuesProvider } from 'contexts/ThemeValues'
import { i18next } from 'locales'
import { I18nextProvider } from 'react-i18next'

export const App = () => (
	<I18nextProvider i18n={i18next}>
		<ThemesProvider>
			<ThemeValuesProvider>
				<Providers />
			</ThemeValuesProvider>
		</ThemesProvider>
	</I18nextProvider>
)
