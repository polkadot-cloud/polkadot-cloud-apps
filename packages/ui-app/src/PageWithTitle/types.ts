// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { PageItem } from 'types'

export type PageWithTitleProps =
	| {
			appTitle?: string
			page: PageItem
			children?: never
			title?: never
	  }
	| {
			appTitle: string
			children: ReactNode
			page?: never
			title: string
	  }
