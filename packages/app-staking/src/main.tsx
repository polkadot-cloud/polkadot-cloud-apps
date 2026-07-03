// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { App } from 'App'
import { createRoot } from 'react-dom/client'
import { version } from '../package.json'

// Network styles
import 'ui-styles/accents/default.scss'
import 'ui-styles/accents/paseo.scss'
import 'ui-styles/accents/westend.scss'

// App styles
import 'ui-styles/fonts/font.scss'
import 'ui-styles/theme/index.scss'
import 'ui-styles/theme/theme.scss'

// Package styles
import '@w3ux/react-odometer/index.css'
import 'simplebar/dist/simplebar.min.css'

// Global services
import { initDedotService } from 'dedot-api'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Failed to find the root element')
}

// Refresh local storage language resources if in development, or if new app version is present.
// This ensures all language keys are up to date
if (
	localStorage.getItem('app_version') !== version ||
	import.meta.env.MODE === 'development'
) {
	localStorage.removeItem('lng_resources')
}

// Initialise global api service
initDedotService()

const root = createRoot(rootElement)

root.render(<App />)
