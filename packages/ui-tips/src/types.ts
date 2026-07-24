// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { MaybeString } from '@w3ux/types'
import type { NetworkId } from 'types'

export interface TipsProps {
	syncing: boolean
	items: TipDisplay[]
	onPageReset: {
		network: NetworkId
		activeAddress: MaybeString
	}
	onUpdate?: (currentItem: TipDisplay | undefined) => void
}

export interface PageToggleProps {
	syncing: boolean
	page: number
	totalItems: number
	setPageHandler: (p: number) => void
}

export interface TipItemsProps {
	items: TipDisplay[]
	page: number
	showTitle: boolean
}

export interface TipDisplay {
	id: string
	onTipClick?: () => void
	faTipIcon?: IconDefinition
	format?: 'warning' | 'danger'
	s: number
	subtitle: string
	description: string[]
	page?: string
}

export interface TipProps {
	title: string
	description: string[]
	page?: string
	onPromptClick: () => void
}
