// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ChatSnapshot } from '../types'

export interface ChatProps {
	// The public messaging origin is fixed for this component's lifetime.
	endpoint: string
	// Undefined while no connected account or synced nomination data is available.
	currentNominations?: string[]
}

export interface ComposerProps {
	state: Pick<ChatSnapshot, 'pending' | 'sending' | 'status' | 'rejected'>
	draft: string
	onChange: (draft: string) => void
	onSend: () => void
	onEdit: () => void
	ready?: boolean
}

export interface MessagesProps {
	state: Pick<
		ChatSnapshot,
		| 'messages'
		| 'error'
		| 'persistent'
		| 'nextCursor'
		| 'loadingOlder'
		| 'status'
		| 'initialized'
	>
	onLoadOlder: () => void
	prompt?: ReactNode
}

export interface WelcomeProps {
	expired: boolean
	onStart: () => void
}
