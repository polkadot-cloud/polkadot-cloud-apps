// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ComponentBase } from 'types'

export type SideProps = ComponentBase & {
	open: boolean
	minimised: boolean
	nav: ReactNode
	bar?: ReactNode
	transparent?: boolean
}

export type FloatingMenuProps = ComponentBase & {
	open: boolean
	minimised: boolean
}

export interface HeadingProps {
	title: string
	minimised: boolean
}
