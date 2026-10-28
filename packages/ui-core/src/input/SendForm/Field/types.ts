// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'

// A titled form field with an optional action alongside the heading.
export type SendFormFieldProps = {
	title: string
	children: ReactNode
	className?: string
	headerContent?: ReactNode
	responsiveHeader?: boolean
}
