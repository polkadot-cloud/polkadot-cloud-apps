// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Plugin } from 'types'

export interface StatusLabelProps {
	backgroundOpacity?: number
	hideIcon?: boolean
	status: string
	statusFor?: Plugin
	title: string
	topOffset?: string
	helpKey?: string
}

export interface WrapperProps {
	$backgroundOpacity?: number
	$topOffset?: string
}
