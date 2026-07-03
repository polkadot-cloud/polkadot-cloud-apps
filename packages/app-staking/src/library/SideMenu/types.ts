// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { FunctionComponent, SVGProps } from 'react'
import type { BulletType } from 'types'

export interface MinimisedProps {
	$advancedMode?: boolean
	$minimised?: boolean
}

export interface HeadingProps {
	title: string
	minimised: boolean
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
