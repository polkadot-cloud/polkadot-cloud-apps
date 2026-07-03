// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RefObject } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextInterface {
	themeElementRef: RefObject<HTMLDivElement | null>
	toggleTheme: (str?: Theme) => void
	mode: Theme
}
