// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
	plugins: [svgr()],
})
