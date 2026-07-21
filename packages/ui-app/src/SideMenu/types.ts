// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { FunctionComponent, ReactNode, SVGProps } from 'react'
import type {
	BulletType,
	PageCategory,
	PageCategoryItems,
	PagesConfigItems,
} from 'types'

export interface SideMenuMainRenderProps {
	activeCategory: number | null
	advancedMode?: boolean
	hidden?: boolean
	showHeaders?: boolean
}

export interface DefaultMenuBarItem {
	faIcon: IconProp
	iconTransform?: string
	key: PageCategory['key']
}

export interface BaseMenuProps {
	barItems: DefaultMenuBarItem[]
	getActivePageForCategory: (category: PageCategory['key']) => string
	localCategory: PageCategory['key']
}
export interface DefaultMenuProps extends BaseMenuProps {
	pageCategories: PageCategoryItems
	pagesConfig: PagesConfigItems
	renderMain: RenderSideMenuMain
	title: string
}

export interface FloatingMenuProps {
	renderMain: RenderSideMenuMain
	title: string
}

export interface NavSimpleProps {
	renderMain: RenderSideMenuMain
	title: string
}
export type RenderSideMenuMain = (props: SideMenuMainRenderProps) => ReactNode

export interface MinimisedProps {
	$advancedMode?: boolean
	$minimised?: boolean
}

export interface HeadingProps {
	title: string
	minimised: boolean
}

export interface CategoriesPopoverProps {
	getActivePageForCategory: (category: PageCategory['key']) => string
	pageCategories: PageCategoryItems
	pagesConfig: PagesConfigItems
	setOpen: (open: boolean) => void
}

export interface PrimaryProps {
	pageKey?: string
	name: string
	active: boolean
	to: string | (() => void)
	faIcon: IconProp
	bullet?: BulletType
	minimised: boolean
	advanced?: boolean
}

export interface SecondaryProps {
	name: string
	classes?: string[]
	onClick: () => void
	active?: boolean
	to?: string
	icon: IconProps
	bullet?: BulletType
	minimised: boolean
}

export interface IconProps {
	Svg: FunctionComponent<SVGProps<SVGSVGElement>>
	size?: string
}
