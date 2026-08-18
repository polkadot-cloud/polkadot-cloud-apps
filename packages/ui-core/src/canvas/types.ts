// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HTMLMotionProps } from 'motion/react'
import type { ComponentBase } from 'types'

export type CanvasVariant = 'default' | 'card'

export type ScrollProps = ComponentBase &
	HTMLMotionProps<'div'> & {
		variant?: CanvasVariant
	}
