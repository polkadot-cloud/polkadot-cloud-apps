// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { forwardRef } from 'react'
import type { ScrollProps } from '../types'
import { CardScroll } from './Card'
import { DefaultScroll } from './Default'

export const Scroll = forwardRef<HTMLDivElement, ScrollProps>(
	({ variant = 'default', ...props }, ref) =>
		variant === 'card' ? (
			<CardScroll ref={ref} {...props} />
		) : (
			<DefaultScroll ref={ref} {...props} />
		),
)

Scroll.displayName = 'Scroll'
