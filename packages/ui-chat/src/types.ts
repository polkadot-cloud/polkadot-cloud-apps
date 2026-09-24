// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type GuidanceGoal = 'MINIMISE_NOMINATIONS' | 'HIGH_RETAINMENT'
export interface GuidanceIntake {
	goals: GuidanceGoal[]
	currentNominations?: string[]
}

export interface ChatMessage {
	id: string
	conversationId: string
	authorType: 'CLIENT' | 'STAFF' | 'SYSTEM'
	kind: string
	body: string
	createdAt: string
	requestId: string
	intake?: GuidanceIntake | null
}

export interface MessageInput {
	requestId: string
	body: string
	intake?: GuidanceIntake
}

export interface MessagePage {
	items: ChatMessage[]
	nextCursor: string | null
}

// Persist only the resumable guest key and an uncertain send, never access tokens.
export interface GuestIdentity {
	key: string
	pending: MessageInput | null
}

export interface GuestSession {
	conversationId: string
	token: string
	expiresAt: number
	guestExpiresAt: number
	intakeRequired: boolean
}

export type SendResult =
	| { ok: true; message: ChatMessage }
	| { ok: false; error: string; status: number }

export interface ServerEvents {
	'message:created': (message: ChatMessage) => void
}

export interface ClientEvents {
	'message:send': (
		input: MessageInput,
		ack: (result: SendResult) => void,
	) => void
}

export type ChatStatus =
	| 'idle'
	| 'connecting'
	| 'live'
	| 'reconnecting'
	| 'expired'

export interface ChatSnapshot {
	status: ChatStatus
	messages: ChatMessage[]
	nextCursor: string | null
	// True once the initial REST history has loaded, even for an empty thread.
	initialized: boolean
	intakeRequired: boolean | null
	sending: boolean
	loadingOlder: boolean
	// Preserve the exact body and request UUID until server persistence is confirmed.
	pending: MessageInput | null
	persistent: boolean
	rejected: boolean
	error: 'connection' | 'history' | 'send' | 'rateLimit' | 'rejected' | null
}
