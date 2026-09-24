// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'

export type ChatTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface ChatPanelProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	portalContainer?: HTMLDivElement
	triggerLabel: string
	closeLabel: string
	title: string
	description: string
	status: string
	statusTone?: ChatTone
	children: ReactNode
	footer?: ReactNode
}

export interface ChatDisplayMessage {
	id: string
	body: string
	createdAt: string
	mine: boolean
	author: string
}

export interface ChatMessagesProps {
	messages: ChatDisplayMessage[]
	label: string
	olderLabel: string
	latestLabel: string
	hasOlder: boolean
	loadingOlder: boolean
	onLoadOlder: () => void
	empty: ReactNode
	loading?: boolean
}

export interface ChatNoticeProps {
	children: ReactNode
	tone?: ChatTone
}

export interface ChatComposerProps {
	value: string
	onChange: (value: string) => void
	onSend: () => void
	label: string
	placeholder: string
	hint: string
	sendLabel: string
	disabled: boolean
	readOnly: boolean
}
