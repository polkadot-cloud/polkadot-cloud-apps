// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface MinimisedProps {
	$advancedMode?: boolean
	$minimised?: boolean
}

export interface PrimaryProps {
	name: string
	active: boolean
	to: string | (() => void)
	faIcon: IconProp
	minimised: boolean
}
