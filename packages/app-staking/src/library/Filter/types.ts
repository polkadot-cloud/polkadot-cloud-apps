// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { ReactNode } from 'react'
import type { AnyFunction } from 'types'

// biome-ignore lint/suspicious/noExplicitAny: <>
export type AnyFilter = any

export interface LargerFilterItemProps {
	disabled?: boolean
	active: boolean
	icon: IconProp
	title: string
	subtitle: string
	transform: string
	onClick: AnyFunction
}
export interface FilterTabsProps {
	config: FilterConfig[]
}

export interface FilterConfig {
	includes: string[]
	excludes: string[]
	label: string
}

export interface ItemProps {
	icon?: IconProp
	label?: string
	transform?: string
	onClick?: () => void
	disabled?: boolean
}

export interface CategoryProps {
	title: string
	buttons?: AnyFilter[]
	children: ReactNode
}

export interface ValidatorFilterContextInterface {
	orderValidators: (v: string) => void
	applyValidatorOrder: (l: AnyFilter, o: string) => AnyFilter
	applyValidatorFilters: (l: AnyFilter, k: string, f?: string[]) => AnyFilter
	toggleFilterValidators: (v: string) => void
	toggleAllValidatorFilters: (t: number) => void
	resetValidatorFilters: () => void
	validatorSearchFilter: (l: AnyFilter, k: string, v: string) => void
	validatorFilters: string[]
	validatorOrder: string
}
