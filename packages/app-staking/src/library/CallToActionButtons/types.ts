// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	IconDefinition,
	Transform,
} from '@fortawesome/fontawesome-svg-core'
import type { CSSProperties, ReactNode } from 'react'

export type CallToActionButton = {
	id?: string
	label: ReactNode
	onClick: () => void
	disabled?: boolean
	kind?: 'primary' | 'secondary'
	standalone?: boolean
	pulse?: boolean
	icon?: IconDefinition
	iconTransform?: Transform
	iconPosition?: 'before' | 'after'
}

export type CallToActionSection = {
	id?: string
	className?: string
	buttons: CallToActionButton[]
}

export type CallToActionButtonsProps = {
	syncing?: boolean
	style?: CSSProperties
	sections: CallToActionSection[]
}
