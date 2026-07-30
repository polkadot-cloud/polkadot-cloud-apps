// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeProvider } from 'styled-components'
import { Page } from 'ui-core/base'
import { Router } from './Router'

export const ThemedRouter = () => {
	const { i18n } = useTranslation()
	const { mode, themeElementRef } = useTheme()

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
				theme="polkadot"
				language={i18n.resolvedLanguage || 'en'}
				ref={themeElementRef}
			>
				<Router />
			</Page.Entry>
		</ThemeProvider>
	)
}
