// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { App } from 'App'
import { initDedotService } from 'dedot-api'
import { createRoot } from 'react-dom/client'

// Network styles
import 'ui-styles/accents/default.scss'

// App styles
import 'ui-styles/fonts/font.scss'
import 'ui-styles/theme/index.scss'
import 'ui-styles/theme/theme.scss'

// Package styles
import '@w3ux/react-odometer/index.css'
import 'simplebar/dist/simplebar.min.css'
import './style.scss'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Failed to find the root element')
}

initDedotService()

createRoot(rootElement).render(<App />)
