// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChatSnapshot } from './types'

export const defaultChatSnapshot: ChatSnapshot = {
	status: 'idle',
	messages: [],
	nextCursor: null,
	initialized: false,
	intakeRequired: null,
	sending: false,
	loadingOlder: false,
	pending: null,
	persistent: true,
	rejected: false,
	error: null,
}
