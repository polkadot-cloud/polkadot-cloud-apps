// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { io, type Socket } from 'socket.io-client'
import {
	createGuestSession,
	getMessagePage,
	getServiceOrigin,
	RequestError,
} from './api'
import {
	INITIAL_RETRY_DELAY_MS,
	MAX_MESSAGE_LENGTH,
	MAX_RETRY_DELAY_MS,
	REQUEST_TIMEOUT_MS,
	TOKEN_RENEWAL_BUFFER_MS,
} from './consts'
import { defaultChatSnapshot } from './defaults'
import { catchUpMessages, mergeMessages } from './history'
import { newIdentity, readIdentity, saveIdentity } from './storage'
import type {
	ChatMessage,
	ChatSnapshot,
	ClientEvents,
	GuestIdentity,
	GuestSession,
	GuidanceIntake,
	SendResult,
	ServerEvents,
} from './types'

// Own one guest thread. Tokens stay in memory; the resumable guest key stays local.
export class ChatClient {
	readonly origin: string
	private identity: GuestIdentity | null
	private snapshot: ChatSnapshot = {
		...defaultChatSnapshot,
		messages: [],
	}

	private listeners = new Set<() => void>()
	private session?: GuestSession
	private socket?: Socket<ServerEvents, ClientEvents>
	private controller = new AbortController()
	private timer?: ReturnType<typeof setTimeout>

	// Async results belong to the connection generation that requested them.
	private generation = 0
	private stopped = true
	private retryDelay = INITIAL_RETRY_DELAY_MS

	// Only REST history advances this boundary; socket events may arrive across a gap.
	private latestHistoryId: string | null = null

	constructor(
		origin: string,
		private readonly openSocket: typeof io = io,
	) {
		this.origin = getServiceOrigin(origin)
		this.identity = readIdentity(this.origin)
		this.snapshot.pending = this.identity?.pending ?? null
	}

	get resumable() {
		return Boolean(this.identity)
	}

	// Stable callbacks and immutable updates support React's external-store subscription.
	getSnapshot = () => this.snapshot
	subscribe = (listener: () => void) => {
		this.listeners.add(listener)
		return () => {
			this.listeners.delete(listener)
		}
	}

	private update(patch: Partial<ChatSnapshot>) {
		this.snapshot = { ...this.snapshot, ...patch }
		for (const listener of this.listeners) {
			listener()
		}
	}

	private save() {
		if (this.identity) {
			this.update({ persistent: saveIdentity(this.origin, this.identity) })
		}
	}

	start() {
		if (!this.stopped) {
			return
		}
		this.identity ??= readIdentity(this.origin) ?? newIdentity()
		this.stopped = false
		// Persist before the exchange so a lost response resumes the same conversation.
		this.save()
		this.update({
			status: 'connecting',
			pending: this.identity.pending,
			error: null,
		})
		void this.connect()
	}

	startNew() {
		this.stop()
		this.identity = newIdentity()
		this.latestHistoryId = null
		this.update({
			messages: [],
			initialized: false,
			intakeRequired: null,
			nextCursor: null,
			pending: null,
			sending: false,
			rejected: false,
		})
		this.start()
	}

	private disconnect() {
		// Invalidate callbacks before aborting work or emitting socket disconnect events.
		this.generation++
		clearTimeout(this.timer)
		this.controller.abort()
		this.controller = new AbortController()
		this.socket?.removeAllListeners()
		this.socket?.disconnect()
		this.socket = undefined
	}

	stop() {
		this.stopped = true
		this.disconnect()
	}

	private retry(error?: unknown) {
		this.disconnect()
		if (this.stopped) {
			return
		}

		// An expired guest must explicitly create a new identity, never retry the old key.
		if (error instanceof RequestError && error.status === 410) {
			this.stopped = true
			this.update({ status: 'expired', error: null, loadingOlder: false })
			return
		}

		this.update({
			status: 'reconnecting',
			error:
				error instanceof RequestError && error.status === 429
					? 'rateLimit'
					: 'connection',
			loadingOlder: false,
		})
		this.timer = setTimeout(() => void this.connect(), this.retryDelay)
		this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_DELAY_MS)
	}

	private async connect() {
		this.disconnect()
		const generation = this.generation
		const current = () => !this.stopped && generation === this.generation
		try {
			if (!this.identity) {
				return
			}
			const session = await createGuestSession(
				this.origin,
				this.identity.key,
				this.controller.signal,
			)
			if (!current()) {
				return
			}
			if (session.expiresAt <= Date.now()) {
				throw new RequestError(401)
			}
			this.session = session
			this.update({ intakeRequired: session.intakeRequired })

			// This client owns reconnection so every socket receives a fresh access token.
			const socket = this.openSocket(this.origin, {
				auth: { token: session.token },
				autoConnect: false,
				reconnection: false,
				forceNew: true,
				timeout: REQUEST_TIMEOUT_MS,
			})
			this.socket = socket

			// Subscribe before joining; merge history rather than overwriting live events.
			socket.on('message:created', (message) => {
				if (current() && message.conversationId === session.conversationId) {
					this.receive([message])
				}
			})
			socket.on('connect', () => {
				if (!current()) {
					return
				}
				this.update({ status: 'live', error: null })
				this.timer = setTimeout(
					() => this.retry(),
					Math.max(0, session.expiresAt - Date.now() - TOKEN_RENEWAL_BUFFER_MS),
				)
				void this.catchUp()
					.then(() => {
						// Reset backoff only once REST history has also caught up successfully.
						if (current()) {
							this.retryDelay = INITIAL_RETRY_DELAY_MS
						}
					})
					.catch((error: unknown) => {
						if (current()) {
							this.retry(error)
						}
					})
			})
			socket.on('connect_error', () => {
				if (current()) {
					this.retry()
				}
			})
			socket.on('disconnect', () => {
				if (current()) {
					this.retry()
				}
			})
			socket.connect()
		} catch (error) {
			if (current()) {
				this.retry(error)
			}
		}
	}

	private page(
		before?: string,
		signal = this.controller.signal,
		session = this.session,
	) {
		if (!session) {
			throw new Error('No chat session')
		}
		return getMessagePage(this.origin, session, signal, before)
	}

	private receive(messages: ChatMessage[]) {
		if (messages.some((message) => message.authorType === 'CLIENT')) {
			this.update({ intakeRequired: false })
		}
		const pending = this.identity?.pending
		// History and live broadcasts can confirm a send even when its ack was lost.
		if (
			pending &&
			messages.some(
				(message) =>
					message.authorType === 'CLIENT' &&
					message.requestId === pending.requestId &&
					message.body === pending.body,
			)
		) {
			if (this.identity) {
				this.identity.pending = null
			}
			this.save()
			this.update({ pending: null, rejected: false, error: null })
		}
		this.update({ messages: mergeMessages(this.snapshot.messages, messages) })
	}

	private async catchUp() {
		const generation = this.generation
		const initialized = this.snapshot.initialized
		const signal = this.controller.signal
		const session = this.session
		const page = await catchUpMessages(
			(before) => this.page(before, signal, session),
			this.latestHistoryId,
			initialized,
		)
		if (this.stopped || generation !== this.generation) {
			return
		}
		this.receive(page.items)
		this.latestHistoryId = page.items.at(-1)?.id ?? null
		this.update({
			initialized: true,
			// Reconnect must preserve the user's position in older-history pagination.
			...(!initialized ? { nextCursor: page.nextCursor } : {}),
		})
	}

	async loadOlder() {
		if (!this.snapshot.nextCursor || this.snapshot.loadingOlder) {
			return
		}
		const generation = this.generation
		this.update({ loadingOlder: true, error: null })
		try {
			const page = await this.page(this.snapshot.nextCursor)
			if (this.stopped || generation !== this.generation) {
				return
			}
			this.receive(page.items)
			this.update({ nextCursor: page.nextCursor })
		} catch {
			if (generation === this.generation) {
				this.update({ error: 'history' })
			}
		} finally {
			if (generation === this.generation) {
				this.update({ loadingOlder: false })
			}
		}
	}

	async send(body: string, intake?: GuidanceIntake) {
		if (
			this.snapshot.sending ||
			!this.identity ||
			this.snapshot.intakeRequired === null ||
			(this.snapshot.intakeRequired &&
				!intake &&
				!this.identity.pending?.intake) ||
			!body.trim() ||
			body.trim().length > MAX_MESSAGE_LENGTH
		) {
			return
		}

		// Keep the exact body and requestId until confirmed, even across reloads.
		let input = this.identity.pending ?? {
			body: body.trim(),
			requestId: crypto.randomUUID(),
		}
		if (this.snapshot.intakeRequired && !input.intake && intake) {
			input = { ...input, intake: structuredClone(intake) }
		}
		const identity = this.identity
		this.identity.pending = input
		this.save()
		this.update({ pending: input, sending: true, rejected: false, error: null })
		try {
			if (!this.socket?.connected) {
				throw new Error('Disconnected')
			}
			const result: SendResult = await this.socket
				.timeout(REQUEST_TIMEOUT_MS)
				.emitWithAck('message:send', input)
			// Confirmations belong to the guest identity, even when its connection changes.
			if (identity !== this.identity) {
				return
			}
			if (!result.ok) {
				throw new RequestError(result.status)
			}
			this.receive([result.message])
		} catch (error) {
			// A broadcast may have confirmed persistence before the ack timed out.
			if (identity === this.identity && this.identity.pending) {
				// A second tab may have already completed intake. Refresh the server
				// state and let the user edit a definitively rejected send.
				const rejected =
					error instanceof RequestError && [400, 409].includes(error.status)
				if (rejected) void this.catchUp().catch(() => {})
				this.update({
					rejected,
					error: rejected
						? 'rejected'
						: error instanceof RequestError && error.status === 429
							? 'rateLimit'
							: 'send',
				})
			}
		} finally {
			if (identity === this.identity) {
				this.update({ sending: false })
			}
		}
	}

	editRejected() {
		if (!this.snapshot.rejected || !this.identity) return
		this.identity.pending = null
		this.save()
		this.update({ pending: null, rejected: false, error: null })
	}
}
