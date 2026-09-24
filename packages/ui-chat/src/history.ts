// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChatMessage, MessagePage } from './types'

// REST pages, live events and acknowledgements can all contain the same message.
export const mergeMessages = (
	previous: ChatMessage[],
	incoming: ChatMessage[],
): ChatMessage[] => {
	const messages = new Map(previous.map((message) => [message.id, message]))
	for (const message of incoming) {
		messages.set(message.id, message)
	}
	// IDs provide a stable order when messages share a creation timestamp.
	return [...messages.values()].sort(
		(a, b) =>
			a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
	)
}

// Keep the last REST boundary fixed: a newer socket event must not hide a gap.
export const catchUpMessages = async (
	load: (before?: string) => Promise<MessagePage>,
	latestId: string | null,
	initialized: boolean,
): Promise<MessagePage> => {
	const page = await load()
	let before = page.nextCursor

	// The first load shows one page. Reconnect walks back to the prior boundary,
	// or to the start of history when the previously initialized thread was empty.
	while (
		initialized &&
		before &&
		!page.items.some((message) => message.id === latestId)
	) {
		const older = await load(before)
		page.items = [...older.items, ...page.items]
		before = older.nextCursor
	}
	// Retain the newest page's cursor for the initial older-history control.
	return page
}
