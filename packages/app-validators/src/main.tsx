// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { initDedotService } from 'dedot-api'
import { createRoot } from 'react-dom/client'
import { version } from '../package.json'
import { App } from './App'

// Network styles
import 'ui-styles/accents/default.scss'

// App styles
import 'ui-styles/fonts/font.scss'
import 'ui-styles/theme/index.scss'
import 'ui-styles/theme/theme.scss'

// Package styles
import '@w3ux/react-odometer/index.css'
import 'simplebar/dist/simplebar.min.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Failed to find the root element')
}

if (
	localStorage.getItem('app_version') !== version ||
	import.meta.env.MODE === 'development'
) {
	localStorage.removeItem('lng_resources')
}

initDedotService({
	nominationPools: false,
	staking: true,
	stablecoins: {
		assetHub: false,
		hydration: false,
	},
})

createRoot(rootElement).render(<App />)
