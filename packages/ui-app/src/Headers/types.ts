// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentType } from 'react'
import type { ToggleConnectProps } from './Popovers/types'

export interface MenuPopoverFeatureFlags {
	network?: boolean
	advancedMode?: boolean
	helpPrompts?: boolean
	share?: boolean
	plugins?: boolean
	syncAccounts?: boolean
	sendModal?: boolean
}

export interface HeadersProps {
	showAccount?: boolean
	AccountComponent?: ComponentType<HeaderAccountProps>
	openAccountsOnConnect?: boolean
	NodesLeft?: Record<string, ComponentType>
	NodesRight?: Record<string, ComponentType>
	menuPopoverFeatures?: MenuPopoverFeatureFlags
}

export type HeaderAccountProps = ToggleConnectProps &
	Pick<MenuPopoverFeatureFlags, 'sendModal'>
