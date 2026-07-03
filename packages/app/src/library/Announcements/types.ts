// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { ReactNode } from 'react'

export interface AnnouncementItem {
	label: string
	value: string
	valueNode?: ReactNode
	secondaryValue?: string
	category?: string
	button?: { text: string; onClick: () => void; disabled: boolean }
	helpKey?: string
	icon?: IconProp
}
