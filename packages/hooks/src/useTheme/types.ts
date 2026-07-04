// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RefObject } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeHookInterface {
	themeElementRef: RefObject<HTMLDivElement | null>
	toggleTheme: (theme?: Theme | null) => void
	mode: Theme
}
