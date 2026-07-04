// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface StatusProps {
	height: number
	isPreloading?: boolean
	showOtherOptions?: boolean
}

export interface MembershipStatusProps {
	showButtons?: boolean
	buttonType?: string
}

export interface NewMemberProps {
	syncing: boolean
	showOtherOptions?: boolean
}
