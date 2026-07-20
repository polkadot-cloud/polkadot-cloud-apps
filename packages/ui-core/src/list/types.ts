// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from 'types'

export type GraphProps = ComponentBase & {
	syncing: boolean
	Inner: React.ReactNode
	canvas?: boolean
}

export type CheckboxProps = ComponentBase & {
	onClick: () => void
	checked: boolean
}

export type HeaderButtonProps = ComponentBase & {
	outline?: boolean
	withText?: boolean
	noMargin?: boolean
}

export type LabelRowProps = ComponentBase & {
	inline?: boolean
}
