// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { RefObject } from 'react'

export interface UiHookInterface {
	setSideMenu: (v: boolean) => void
	setUserSideMenuMinimised: (v: boolean) => void
	setContainerRefs: (
		v: Record<string, RefObject<HTMLDivElement | null>>,
	) => void
	sideMenuOpen: boolean
	userSideMenuMinimised: boolean
	sideMenuMinimised: boolean
	containerRefs: Record<string, RefObject<HTMLDivElement | null>>
	isBraveBrowser: boolean
	advancedMode: boolean
	setAdvancedMode: (value: boolean) => void
}
