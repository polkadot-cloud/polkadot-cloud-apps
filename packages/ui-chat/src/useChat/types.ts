// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChatSnapshot } from '../types'

export interface ChatHookInterface {
	state: ChatSnapshot
	open: boolean
	started: boolean
	draft: string
	setDraft: (draft: string) => void
	setOpen: (open: boolean) => void
	start: () => void
	startNew: () => void
	send: () => void
	loadOlder: () => void
}
