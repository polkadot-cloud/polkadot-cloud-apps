// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'
import type { MaybeAddress } from 'types'

export interface SelectItemsProps {
	layout?: 'two-col' | 'three-col'
	children?: ReactNode[]
}

export interface SelectItemProps {
	title: string
	subtitle: string
	icon: ReactNode
	selected: boolean
	onClick: () => void
	layout?: 'two-col' | 'three-col'
	hoverBorder?: boolean
	grow?: boolean
	disabled?: boolean
	includeToggle?: boolean
	bodyRef?: RefObject<HTMLDivElement | null>
	containerRef?: RefObject<HTMLDivElement | null>
	account?: MaybeAddress
	setAccount?: Dispatch<SetStateAction<MaybeAddress>>
}
