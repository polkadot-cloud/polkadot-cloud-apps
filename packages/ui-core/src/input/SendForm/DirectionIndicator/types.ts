// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import type { ComponentProps, ReactNode } from 'react'

// An interactive control between form fields, with an icon and optional text.
export type SendFormDirectionButtonProps = ComponentProps<'button'> & {
	icon: FontAwesomeIconProps['icon']
	rotation?: FontAwesomeIconProps['rotation']
}

// A direction marker or reverse action, with space for additional controls.
export type SendFormDirectionIndicatorProps = {
	onReverse?: () => void
	label?: string
	children?: ReactNode
	tooltip?: string
	tooltipContainer?: HTMLDivElement
}
