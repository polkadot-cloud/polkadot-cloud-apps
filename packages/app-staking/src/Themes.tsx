// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Router } from 'Router'
import { useNetwork } from 'hooks/useNetwork'
import { useTheme } from 'hooks/useTheme'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeProvider } from 'styled-components'
import { Page } from 'ui-core/base'

export const ThemedRouter = () => {
	const { i18n } = useTranslation()
	const { network } = useNetwork()
	const { mode, themeElementRef } = useTheme()

	// Update body background to `--bg-body` color upon theme change.
	useEffect(() => {
		const elem = document.querySelector('.core-entry')
		if (elem) {
			document.getElementsByTagName('body')[0].style.backgroundColor =
				getComputedStyle(elem).getPropertyValue('--bg-body')
		}
	}, [mode])

	return (
		<ThemeProvider theme={{ mode }}>
			<Page.Entry
				mode={mode}
				theme={`${network}`}
				language={i18n.resolvedLanguage || 'en'}
				ref={themeElementRef}
			>
				<Router />
			</Page.Entry>
		</ThemeProvider>
	)
}
