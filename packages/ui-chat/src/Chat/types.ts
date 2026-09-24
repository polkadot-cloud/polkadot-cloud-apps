// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChatSnapshot } from '../types'

export interface ChatProps {
	// The public messaging origin is fixed for this component's lifetime.
	endpoint: string
}

export interface ComposerProps {
	state: Pick<ChatSnapshot, 'pending' | 'sending' | 'status'>
	draft: string
	onChange: (draft: string) => void
	onSend: () => void
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
}

export interface WelcomeProps {
	expired: boolean
	onStart: () => void
}
