// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { App } from 'App'
import { initDedotService } from 'dedot-api'
import { createRoot } from 'react-dom/client'
import { clearDisabledExtensionsLocal } from 'ui-app/util'

// Network styles
import 'ui-styles/accents/default.scss'

// App styles
import 'ui-styles/fonts/font.scss'
import 'ui-styles/theme/index.scss'
import 'ui-styles/theme/theme.scss'

// Package styles
import '@polkadot-cloud/ui/odometer/index.css'
import 'simplebar/dist/simplebar.min.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Failed to find the root element')
}

// Prevent reconnecting to disabled extensions from a saved session
clearDisabledExtensionsLocal()

initDedotService({
	network: 'polkadot',
	nominationPools: false,
	staking: false,
	swap: true,
	stablecoins: { assetHub: true, hydration: false },
})

createRoot(rootElement).render(<App />)
